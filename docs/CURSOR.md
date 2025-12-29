# 🎯 Cursor Documentation

Cursor is an AI-powered code editor that understands your codebase and helps you code faster through natural language. Just describe what you want to build or change and Cursor will generate the code for you.

## 📋 Table of Contents

1. [What is Cursor?](#what-is-cursor)
2. [Models Available](#models-available)
3. [Getting Started](#getting-started)
4. [Key Features](#key-features)
5. [MCP Integration](#mcp-integration)
6. [Best Practices](#best-practices)
7. [Resources](#resources)

---

## 🎯 What is Cursor?

Cursor is an AI-powered code editor built on VS Code that provides:

- **AI Code Generation**: Generate code from natural language descriptions
- **Codebase Understanding**: Understands your entire codebase context
- **Intelligent Autocomplete**: Context-aware code suggestions
- **Chat Interface**: Interactive AI assistant for coding questions
- **Composer Mode**: Multi-file editing and refactoring
- **MCP Support**: Integration with external services via Model Context Protocol

---

## 🤖 Models Available

Cursor supports multiple AI models with different capabilities:

| Model | Default Context | Max Mode | Capabilities |
|-------|----------------|----------|--------------|
| **Claude 4.5 Opus** | 200k | 200k | Best for complex reasoning |
| **Claude 4.5 Sonnet** | 200k | 1M | Balanced performance |
| **Composer 1** | 200k | - | Multi-file editing |
| **Gemini 3 Flash** | 200k | 1M | Fast responses |
| **Gemini 3 Pro** | 200k | 1M | High quality |
| **GPT-5.1 Codex Max** | 272k | - | Code-focused |
| **GPT-5.2** | 272k | - | Latest GPT model |
| **Grok Code** | 256k | - | Code generation |

### Model Selection Tips

- **For complex refactoring**: Use Claude 4.5 Opus or Sonnet
- **For quick code generation**: Use Gemini 3 Flash
- **For multi-file changes**: Use Composer 1
- **For code-specific tasks**: Use GPT-5.1 Codex Max

---

## 🚀 Getting Started

### Installation

1. **Download Cursor**
   - Visit [cursor.com/downloads](https://cursor.com/downloads)
   - Download for your operating system (Windows, macOS, Linux)

2. **Install Cursor**
   - Run the installer
   - Follow the setup wizard

3. **Open Your Project**
   - File → Open Folder
   - Select your project directory

### First Steps

1. **Open Chat**
   - Press `Ctrl+L` (Windows/Linux) or `Cmd+L` (macOS)
   - Start describing what you want to build

2. **Try Composer**
   - Press `Ctrl+I` (Windows/Linux) or `Cmd+I` (macOS)
   - Describe multi-file changes

3. **Use Inline Edit**
   - Select code
   - Press `Ctrl+K` (Windows/Linux) or `Cmd+K` (macOS)
   - Describe the change

---

## ✨ Key Features

### 1. Chat Interface

Ask questions about your codebase:

```
"How does authentication work in this app?"
"Show me all the API endpoints"
"Explain the database schema"
```

### 2. Code Generation

Generate code from descriptions:

```
"Create a React component for user profile"
"Add error handling to the payment form"
"Generate TypeScript types for the API response"
```

### 3. Composer Mode

Make changes across multiple files:

```
"Refactor the authentication to use JWT tokens"
"Add dark mode support to all components"
"Update all API calls to use the new endpoint structure"
```

### 4. Codebase Understanding

Cursor understands:
- Project structure
- Dependencies
- Code patterns
- File relationships
- Type definitions

### 5. Intelligent Autocomplete

Context-aware suggestions based on:
- Your codebase
- Current file context
- Imported modules
- Type definitions

---

## 🔗 MCP Integration

This project uses Model Context Protocol (MCP) to integrate with external services:

### Available MCP Servers

1. **GitHub MCP**
   - Repository management
   - Issue and PR management
   - See [GITHUB_MCP_SETUP.md](./GITHUB_MCP_SETUP.md)

2. **Supabase MCP**
   - Database queries
   - Migration management
   - Project management

3. **Render MCP**
   - Service management
   - Deployment control
   - See [RENDER.md](./RENDER.md)

4. **PostgreSQL MCP** (Custom)
   - Direct database queries
   - Schema inspection
   - Table statistics
   - See [MCP_SERVER_DEVELOPMENT.md](./MCP_SERVER_DEVELOPMENT.md)

### MCP Configuration

MCP servers are configured in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token"
      }
    },
    "supabase": {
      "url": "https://mcp.supabase.com/mcp",
      "headers": {}
    },
    "render": {
      "url": "https://mcp.render.com/mcp",
      "headers": {
        "Authorization": "Bearer your_api_key"
      }
    }
  }
}
```

---

## 💡 Best Practices

### 1. Be Specific

❌ **Bad**: "Fix the bug"
✅ **Good**: "Fix the authentication error that occurs when users try to log in with expired tokens"

### 2. Provide Context

When asking about code:
- Mention the file or component
- Describe the expected behavior
- Include error messages if applicable

### 3. Use Composer for Multi-file Changes

For changes affecting multiple files:
- Use Composer mode (`Ctrl+I` / `Cmd+I`)
- Describe the overall change
- Review the generated changes

### 4. Review Generated Code

Always review AI-generated code:
- Check for security issues
- Verify logic correctness
- Ensure it follows project conventions
- Run tests

### 5. Iterate and Refine

- Start with a simple request
- Refine based on results
- Ask follow-up questions
- Use chat to understand generated code

### 6. Use for Repetitive Tasks

Cursor excels at:
- Creating boilerplate code
- Generating tests
- Writing documentation
- Refactoring similar patterns

---

## 📚 Resources

### Official Resources

- **Get Started**: [docs.cursor.com/get-started/quickstart](https://docs.cursor.com/get-started/quickstart)
- **Changelog**: [cursor.com/changelog](https://www.cursor.com/changelog)
- **Concepts**: [docs.cursor.com/get-started/concepts](https://docs.cursor.com/get-started/concepts)
- **Downloads**: [cursor.com/downloads](https://cursor.com/downloads)
- **Models**: [docs.cursor.com/models](https://docs.cursor.com/models)

### Community

- **Forum**: [forum.cursor.com](https://forum.cursor.com) - Technical queries and experiences
- **Support**: [hi@cursor.com](mailto:hi@cursor.com) - Account and billing questions

### Project-Specific Documentation

- [GitHub MCP Setup](./GITHUB_MCP_SETUP.md) - GitHub integration
- [Render Setup](./RENDER.md) - Render deployment
- [Supabase Setup](./SUPABASE.md) - Database setup
- [MCP Server Development](./MCP_SERVER_DEVELOPMENT.md) - Building custom MCP servers
- [Cursor Troubleshooting](./CURSOR_TROUBLESHOOTING.md) - Troubleshooting guide

---

## 🎓 Learning Path

### Beginner

1. Install Cursor
2. Open a project
3. Try the chat interface
4. Generate a simple component

### Intermediate

1. Use Composer for multi-file changes
2. Set up MCP servers
3. Integrate with GitHub
4. Use for refactoring

### Advanced

1. Custom MCP servers
2. Complex codebase refactoring
3. Automated testing generation
4. Documentation generation

---

## 🔧 Troubleshooting

### Cursor Not Responding

1. Check internet connection
2. Restart Cursor
3. Check MCP server status
4. Review error logs (View → Output → "Cursor")

### Code Generation Issues

1. Be more specific in your request
2. Provide more context
3. Break down complex tasks
4. Check model selection

### MCP Server Issues

1. Verify API keys/tokens
2. Check server status
3. Review MCP configuration
4. See specific MCP documentation

---

## 📝 Notes

- Cursor works best with well-structured codebases
- Provide clear, specific instructions
- Always review and test generated code
- Use version control (Git) to track changes
- Keep MCP credentials secure

---

**Last Updated**: December 2024
**Cursor Version**: Latest
**Project**: Portal-main

