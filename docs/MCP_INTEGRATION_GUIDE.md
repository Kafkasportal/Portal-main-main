# 🔧 MCP Integration Guide - Kafkasder Management Panel

This guide explains how to integrate Model Context Protocol (MCP) servers with your AI development environment for the Kafkasder Management Panel project.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Setup](#quick-setup)
3. [Supported MCP Servers](#supported-mcp-servers)
4. [IDE Configurations](#ide-configurations)
5. [Usage Examples](#usage-examples)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

MCP (Model Context Protocol) allows AI assistants to interact with external services and tools. This project integrates with:

- **Render MCP Server**: Manage Render infrastructure (services, databases, logs)
- **GitHub MCP Server**: Manage GitHub repositories, issues, PRs
- **Codacy MCP Server**: Code quality analysis (already configured)

---

## 🚀 Quick Setup

### 1. Check Environment

```bash
npm run mcp:check
```

### 2. Set Up Environment Variables

Copy and configure your environment:

```bash
cp .env.example .env.local
```

Add your API keys to `.env.local`:

```env
# MCP Configuration
RENDER_API_KEY=rnd_xxxxxxxxxxxxxxxxxxxx
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
RENDER_DEFAULT_WORKSPACE=Kafkasportal
```

### 3. Initialize MCP for Your IDE

**For Cursor:**

```bash
npm run mcp:init:cursor
```

**For VS Code:**

```bash
npm run mcp:init:vscode
```

**For Claude Desktop:**
See [Claude Desktop Configuration](#claude-desktop)

---

## 🛠️ Supported MCP Servers

### Render MCP Server

**Purpose**: Infrastructure management via natural language
**URL**: `https://mcp.render.com/mcp`
**Authentication**: Bearer token (Render API Key)

**Capabilities**:

- ✅ Create/list web services and static sites
- ✅ Create/list PostgreSQL databases
- ✅ Execute read-only SQL queries
- ✅ View service logs and metrics
- ✅ Monitor deploy history
- ❌ Delete services (safety limitation)
- ❌ Create free tier instances

### GitHub MCP Server

**Purpose**: Repository management
**URL**: `https://mcp.github.com`
**Authentication**: Bearer token (GitHub Personal Access Token)

**Required GitHub Token Scopes**:

- `repo` - Repository access
- `read:org` - Organization access
- `read:user` - User information
- `read:project` - Project access

---

## ⚙️ IDE Configurations

### Cursor

Configuration is automatically created at `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "render": {
      "url": "https://mcp.render.com/mcp",
      "headers": {
        "Authorization": "Bearer ${RENDER_API_KEY}"
      }
    },
    "github": {
      "url": "https://mcp.github.com",
      "headers": {
        "Authorization": "Bearer ${GITHUB_TOKEN}"
      }
    }
  }
}
```

### VS Code (GitHub Copilot)

Configuration is added to `.vscode/settings.json`:

```json
{
  "chat.mcp.servers": {
    "render": {
      "url": "https://mcp.render.com/mcp",
      "headers": {
        "Authorization": "Bearer ${RENDER_API_KEY}"
      }
    }
  }
}
```

### Claude Desktop

Add to your Claude Desktop configuration:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "render": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://mcp.render.com/mcp",
        "--header",
        "Authorization: Bearer ${RENDER_API_KEY}"
      ],
      "env": {
        "RENDER_API_KEY": "${RENDER_API_KEY}"
      }
    }
  }
}
```

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "render": {
      "url": "https://mcp.render.com/mcp",
      "headers": {
        "Authorization": "Bearer ${RENDER_API_KEY}"
      }
    }
  }
}
```

---

## 💡 Usage Examples

### Initial Setup

First, set your workspace in your AI assistant:

```
Set my Render workspace to Kafkasportal
```

### Infrastructure Management

**Service Management:**

```
List my Render services
Show details for kafkasder-panel service
Create a new web service named api-service using https://github.com/Kafkasportal/Portal
```

**Database Operations:**

```
List my Render databases
Create a new database named prod-db with 10 GB storage
Query my database: SELECT COUNT(*) FROM members WHERE active = true
```

**Monitoring & Troubleshooting:**

```
Show recent error logs for kafkasder-panel
What was the CPU usage for my service yesterday?
Why isn't my site at kafkasder-panel.onrender.com working?
Pull the most recent error-level logs for my service
```

**Deploy Tracking:**

```
Show deploy history for kafkasder-panel
What happened in the latest deploy?
What was the busiest traffic day this month?
```

### Repository Management

**GitHub Operations:**

```
List issues in Kafkasportal/Portal repository
Create a new issue for bug in member registration
Show recent commits in the main branch
Create a pull request from feature-branch to main
```

### Code Quality Analysis

**Codacy Operations** (already configured):

```
Analyze code quality for the current file
Show security vulnerabilities in the project
Run Codacy CLI analysis on src/components/members/
```

---

## 🔧 Troubleshooting

### Environment Variables Not Set

```bash
npm run mcp:check
```

This will show which variables are missing.

### MCP Server Not Responding

1. Verify your API keys are correct and have proper permissions
2. Check your network connection
3. Try restarting your IDE

### Render Workspace Issues

Make sure to set your workspace first:

```
Set my Render workspace to Kafkasportal
```

### GitHub Token Permissions

Your GitHub token needs these scopes:

- `repo` - Full repository access
- `read:org` - Organization access
- `read:user` - User profile access

### VS Code MCP Not Working

1. Make sure you have GitHub Copilot enabled
2. Restart VS Code after configuration changes
3. Check the Output panel for MCP-related errors

### Cursor MCP Issues

1. Ensure `.cursor/mcp.json` exists and is valid JSON
2. Restart Cursor after configuration changes
3. Check Cursor settings for MCP enablement

---

## 🔐 Security Considerations

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive credentials  
3. **Rotate keys regularly** especially for production environments
4. **Limit token scopes** to minimum required permissions
5. **Monitor API usage** to detect unusual activity

---

## 📚 Additional Resources

- [Render MCP Server Documentation](https://docs.render.com/mcp)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Cursor MCP Documentation](https://docs.cursor.com/context/mcp)

---

## 🆘 Getting Help

If you encounter issues:

1. **Check the project documentation** in `docs/` folder
2. **Run diagnostics**: `npm run mcp:check`
3. **Verify configurations** using the templates in `mcp-render-config.template`
4. **Review logs** in your AI assistant's output/debug panels

**Project-specific MCP servers:**

- **Render MCP**: See `docs/RENDER.md`
- **GitHub MCP**: See `docs/GITHUB_MCP_SETUP.md`
- **Codacy MCP**: See `.github/instructions/codacy.instructions.md`
