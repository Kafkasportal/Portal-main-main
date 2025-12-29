# 🔧 MCP Server Development Guide

This guide teaches you how to build a Model Context Protocol (MCP) server that integrates PostgreSQL with Cursor, allowing you to query databases and access schemas directly from your editor.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Implementation Steps](#implementation-steps)
4. [PostgreSQL MCP Server](#postgresql-mcp-server)
5. [Testing](#testing)
6. [Integration with Cursor](#integration-with-cursor)
7. [Scaling Beyond Local](#scaling-beyond-local)
8. [Reference Implementation](#reference-implementation)

---

## 🎯 Overview

MCP servers connect custom data sources to Cursor, making external context (like databases, browser data, or logs) available during development. This guide demonstrates building a Postgres MCP server that:

- ✅ Runs SQL queries against a database
- ✅ Exposes table schemas as structured resources
- ✅ Uses local stdio communication (avoiding complex security setup)

> "MCP servers let you connect custom data sources and make them available for use inside Cursor."

---

## 🏗️ Architecture

The server runs locally and communicates via stdio (standard input/output streams):

```
User in Cursor → Cursor ↔ MCP Server (stdio) ↔ Postgres Database
```

### Key Components

1. **MCP SDK**: Provides the protocol implementation
2. **Transport Layer**: stdio for local, HTTP for remote
3. **Database Driver**: PostgreSQL client library
4. **Schema Validation**: Zod for type safety

---

## 🚀 Implementation Steps

### 1. Project Setup

```bash
# Create project directory
mkdir postgres-mcp-server
cd postgres-mcp-server

# Initialize with Bun (or npm/yarn)
bun init

# Install dependencies
bun add postgres @modelcontextprotocol/sdk zod

# Or with npm
npm init -y
npm install postgres @modelcontextprotocol/sdk zod
```

### 2. Define Specifications

Create a `spec.md` outlining goals:

```markdown
# PostgreSQL MCP Server Specification

## Goals
- Configure DATABASE_URL through MCP environment
- Query data via tools (readonly by default, with optional write operations)
- Access tables as resources
- Use Zod for schema validation

## Features
- Execute SQL queries
- List database schemas
- Describe table structures
- Read-only by default (configurable)
```

### 3. Build with Context

Use Cursor with references to:

- [MCP SDK README](https://github.com/modelcontextprotocol/typescript-sdk)
- [Postgres library README](https://github.com/porsager/postgres)
- Your specification

**Prompt Example:**
```
Create a PostgreSQL MCP server that:
1. Connects to a database using DATABASE_URL environment variable
2. Exposes a tool to execute SQL queries (read-only by default)
3. Exposes resources for each table schema
4. Uses Zod for validation
5. Follows the MCP SDK patterns
```

### 4. Test Locally

Use the MCP Inspector to verify functionality:

```bash
# With Bun
npx @modelcontextprotocol/inspector bun run index.ts

# With Node.js
npx @modelcontextprotocol/inspector node index.js
```

### 5. Integrate with Cursor

Once tested, connect the server to Cursor for real-world usage, enabling direct database queries and schema inspection.

---

## 🗄️ PostgreSQL MCP Server

### Basic Implementation Structure

```typescript
// index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import postgres from 'postgres'
import { z } from 'zod'

// Initialize server
const server = new Server(
  {
    name: 'postgres-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
)

// Database connection
let sql: ReturnType<typeof postgres> | null = null

// Initialize connection
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'execute_query',
        description: 'Execute a SQL query against the database',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'SQL query to execute',
            },
            readonly: {
              type: 'boolean',
              description: 'Whether the query is read-only (default: true)',
              default: true,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'list_tables',
        description: 'List all tables in the database',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  }
})

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  if (!sql) {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required')
    }
    sql = postgres(databaseUrl)
  }

  switch (name) {
    case 'execute_query':
      const { query, readonly = true } = args as {
        query: string
        readonly?: boolean
      }

      if (readonly && !/^\s*SELECT/i.test(query)) {
        throw new Error('Only SELECT queries are allowed in readonly mode')
      }

      const result = await sql.unsafe(query)
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      }

    case 'list_tables':
      const tables = await sql`
        SELECT table_name, table_schema
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
      `
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(tables, null, 2),
          },
        ],
      }

    default:
      throw new Error(`Unknown tool: ${name}`)
  }
})

// Handle resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  if (!sql) {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      return { resources: [] }
    }
    sql = postgres(databaseUrl)
  }

  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `

  return {
    resources: tables.map((table) => ({
      uri: `postgres://table/${table.table_name}`,
      name: table.table_name,
      description: `Schema for table: ${table.table_name}`,
      mimeType: 'application/json',
    })),
  }
})

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params

  if (!uri.startsWith('postgres://table/')) {
    throw new Error(`Invalid resource URI: ${uri}`)
  }

  const tableName = uri.replace('postgres://table/', '')

  if (!sql) {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required')
    }
    sql = postgres(databaseUrl)
  }

  const schema = await sql`
    SELECT
      column_name,
      data_type,
      is_nullable,
      column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = ${tableName}
    ORDER BY ordinal_position
  `

  return {
    contents: [
      {
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(schema, null, 2),
      },
    ],
  }
})

// Start server
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('PostgreSQL MCP server running on stdio')
}

main().catch(console.error)
```

### Environment Configuration

Create `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/database
```

Or use Supabase connection string:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

---

## 🧪 Testing

### Using MCP Inspector

```bash
# Install inspector
npm install -g @modelcontextprotocol/inspector

# Run with Bun
npx @modelcontextprotocol/inspector bun run index.ts

# Run with Node.js
npx @modelcontextprotocol/inspector node index.js
```

### Manual Testing

1. Start the server
2. Use Cursor's chat to test:
   ```
   "List all tables in the database"
   "Show me the schema for the users table"
   "Execute this query: SELECT * FROM users LIMIT 10"
   ```

---

## 🔗 Integration with Cursor

### Configuration

Add to `.cursor/mcp.json` or `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "postgres": {
      "command": "bun",
      "args": ["run", "index.ts"],
      "env": {
        "DATABASE_URL": "postgresql://user:password@localhost:5432/db"
      }
    }
  }
}
```

Or with Node.js:

```json
{
  "mcpServers": {
    "postgres": {
      "command": "node",
      "args": ["index.js"],
      "env": {
        "DATABASE_URL": "postgresql://user:password@localhost:5432/db"
      }
    }
  }
}
```

### Restart Cursor

After configuration:
1. Close Cursor completely
2. Reopen Cursor
3. MCP server should connect automatically

---

## 📈 Scaling Beyond Local

For team environments, convert the stdio transport to HTTP:

### Benefits

- ✅ Shared database access across team members
- ✅ Centralized configuration management
- ✅ Enhanced security (auth, rate limiting, access controls)
- ✅ Observability and monitoring

### HTTP Implementation

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import express from 'express'

const app = express()
app.use(express.json())

const transport = new SSEServerTransport('/message', app)
await server.connect(transport)

app.listen(3000, () => {
  console.log('MCP server running on http://localhost:3000')
})
```

### Deployment Options

1. **VPC-hosted service**: Deploy to internal network
2. **Cloud service**: AWS, GCP, Azure with authentication
3. **Docker container**: Easy deployment and scaling

---

## 📚 Key MCP Concepts

### Tools

Expose actions like executing queries:

```typescript
{
  name: 'execute_query',
  description: 'Execute SQL query',
  inputSchema: { /* JSON Schema */ }
}
```

### Resources

Share standardized context like schema information:

```typescript
{
  uri: 'postgres://table/users',
  name: 'users',
  description: 'Users table schema',
  mimeType: 'application/json'
}
```

### Prompts

Enable advanced workflows:

```typescript
{
  name: 'analyze_schema',
  description: 'Analyze database schema',
  arguments: [
    {
      name: 'table',
      description: 'Table name to analyze',
      required: true
    }
  ]
}
```

---

## 🔗 Reference Implementation

A complete example is available at:
- [pg-mcp-server](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres)

### Project Structure

```
postgres-mcp-server/
├── index.ts          # Main server file
├── package.json       # Dependencies
├── tsconfig.json      # TypeScript config
├── .env              # Environment variables
├── spec.md           # Specification
└── README.md         # Documentation
```

---

## 🎓 Best Practices

### 1. Security

- ✅ Use read-only mode by default
- ✅ Validate SQL queries
- ✅ Use parameterized queries
- ✅ Implement rate limiting
- ✅ Log all queries

### 2. Error Handling

```typescript
try {
  const result = await sql.unsafe(query)
  return { content: [{ type: 'text', text: JSON.stringify(result) }] }
} catch (error) {
  return {
    content: [
      {
        type: 'text',
        text: `Error: ${error instanceof Error ? error.message : String(error)}`,
      },
    ],
    isError: true,
  }
}
```

### 3. Performance

- ✅ Use connection pooling
- ✅ Implement query timeout
- ✅ Cache schema information
- ✅ Limit result sets

### 4. Documentation

- ✅ Document all tools
- ✅ Provide examples
- ✅ Include error codes
- ✅ Update changelog

---

## 🐛 Troubleshooting

### Server Not Connecting

1. Check DATABASE_URL environment variable
2. Verify database is accessible
3. Check MCP server logs
4. Restart Cursor

### Query Errors

1. Validate SQL syntax
2. Check table permissions
3. Verify connection string
4. Review error messages

### Performance Issues

1. Check query complexity
2. Review connection pool settings
3. Monitor database load
4. Optimize queries

---

## 📝 Next Steps

1. **Add more tools**: Table creation, data insertion
2. **Implement caching**: Cache schema information
3. **Add authentication**: Secure access to database
4. **Create prompts**: Advanced query workflows
5. **Deploy HTTP version**: Team-wide access

---

**Last Updated**: December 2024
**MCP Version**: Latest
**Project**: Portal-main





