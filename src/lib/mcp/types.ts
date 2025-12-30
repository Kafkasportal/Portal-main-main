/**
 * MCP (Model Context Protocol) TypeScript types and utilities
 * for the Kafkasder Management Panel project.
 */

export interface MCPServerConfig {
  url: string;
  headers?: Record<string, string>;
  description?: string;
}

export interface MCPConfig {
  mcpServers: Record<string, MCPServerConfig>;
}

export interface EnvironmentVariable {
  name: string;
  description: string;
  optional?: boolean;
  defaultValue?: string;
}

export interface IDEConfig {
  name: string;
  file: string;
  template: Record<string, any>;
}

/**
 * Supported MCP server configurations
 */
export const MCP_SERVERS = {
  RENDER: 'render',
  GITHUB: 'github',
  CODACY: 'codacy',
  SENTRY: 'sentry'
} as const;

export type MCPServerType = typeof MCP_SERVERS[keyof typeof MCP_SERVERS];

/**
 * Supported IDE configurations
 */
export const SUPPORTED_IDES = {
  CURSOR: 'cursor',
  VSCODE: 'vscode',
  CLAUDE_DESKTOP: 'claude-desktop',
  WINDSURF: 'windsurf'
} as const;

export type SupportedIDE = typeof SUPPORTED_IDES[keyof typeof SUPPORTED_IDES];

/**
 * MCP server endpoints and configurations
 */
export const MCP_SERVER_CONFIGS: Record<MCPServerType, MCPServerConfig> = {
  render: {
    url: 'https://mcp.render.com/mcp',
    headers: {
      Authorization: 'Bearer ${RENDER_API_KEY}'
    },
    description: 'Render infrastructure management'
  },
  github: {
    url: 'https://mcp.github.com',
    headers: {
      Authorization: 'Bearer ${GITHUB_TOKEN}'
    },
    description: 'GitHub repository management'
  },
  codacy: {
    url: 'https://mcp.codacy.com/mcp',
    headers: {
      Authorization: 'Bearer ${CODACY_API_TOKEN}'
    },
    description: 'Code quality analysis'
  },
  sentry: {
    url: 'https://mcp.sentry.io/mcp',
    headers: {
      Authorization: 'Bearer ${SENTRY_ACCESS_TOKEN}'
    },
    description: 'Error tracking and monitoring'
  }
};

/**
 * Required environment variables for MCP integration
 */
export const REQUIRED_ENV_VARS: EnvironmentVariable[] = [
  {
    name: 'RENDER_API_KEY',
    description: 'Render API Key for infrastructure management',
    optional: false
  },
  {
    name: 'GITHUB_TOKEN',
    description: 'GitHub Personal Access Token for repository management',
    optional: false
  },
  {
    name: 'RENDER_DEFAULT_WORKSPACE',
    description: 'Default Render workspace',
    optional: true,
    defaultValue: 'Kafkasportal'
  },
  {
    name: 'CODACY_API_TOKEN',
    description: 'Codacy API token for code quality analysis',
    optional: true
  },
  {
    name: 'SENTRY_ACCESS_TOKEN',
    description: 'Sentry access token for error tracking',
    optional: true
  }
];

/**
 * IDE-specific configuration templates
 */
export const IDE_CONFIGS: Record<SupportedIDE, IDEConfig> = {
  cursor: {
    name: 'Cursor',
    file: '.cursor/mcp.json',
    template: {
      mcpServers: {
        render: MCP_SERVER_CONFIGS.render,
        github: MCP_SERVER_CONFIGS.github
      }
    }
  },
  vscode: {
    name: 'VS Code',
    file: '.vscode/settings.json',
    template: {
      'chat.mcp.discovery.enabled': {
        'claude-desktop': true,
        'windsurf': true,
        'cursor-global': true,
        'cursor-workspace': true
      },
      'chat.mcp.access': 'all',
      'chat.mcp.servers': {
        render: MCP_SERVER_CONFIGS.render
      }
    }
  },
  'claude-desktop': {
    name: 'Claude Desktop',
    file: 'claude_desktop_config.json', // Platform-specific path
    template: {
      mcpServers: {
        render: {
          command: 'npx',
          args: [
            'mcp-remote',
            MCP_SERVER_CONFIGS.render.url,
            '--header',
            'Authorization: Bearer ${RENDER_API_KEY}'
          ],
          env: {
            RENDER_API_KEY: '${RENDER_API_KEY}'
          }
        }
      }
    }
  },
  windsurf: {
    name: 'Windsurf',
    file: '~/.codeium/windsurf/mcp_config.json',
    template: {
      mcpServers: {
        render: MCP_SERVER_CONFIGS.render,
        github: MCP_SERVER_CONFIGS.github
      }
    }
  }
};

/**
 * Common MCP usage examples for the Kafkasder project
 */
export const MCP_USAGE_EXAMPLES = {
  setup: [
    'Set my Render workspace to Kafkasportal'
  ],
  infrastructure: [
    'List my Render services',
    'Show details for kafkasder-panel service',
    'Create a new web service named api-service using https://github.com/Kafkasportal/Portal',
    'List my Render databases',
    'Create a new database named prod-db with 10 GB storage',
    'Query my database: SELECT COUNT(*) FROM members WHERE active = true'
  ],
  monitoring: [
    'Show recent error logs for kafkasder-panel',
    'What was the CPU usage for my service yesterday?',
    'Why isn\'t my site at kafkasder-panel.onrender.com working?',
    'Pull the most recent error-level logs for my service',
    'Show deploy history for kafkasder-panel',
    'What happened in the latest deploy?'
  ],
  github: [
    'List issues in Kafkasportal/Portal repository',
    'Create a new issue for bug in member registration',
    'Show recent commits in the main branch',
    'Create a pull request from feature-branch to main'
  ],
  codeQuality: [
    'Analyze code quality for the current file',
    'Show security vulnerabilities in the project',
    'Run Codacy CLI analysis on src/components/members/'
  ]
};

/**
 * Utility function to validate MCP configuration
 */
export function validateMCPConfig(config: MCPConfig): boolean {
  if (!config.mcpServers || typeof config.mcpServers !== 'object') {
    return false;
  }

  for (const [serverName, serverConfig] of Object.entries(config.mcpServers)) {
    if (!serverConfig.url || typeof serverConfig.url !== 'string') {
      console.error(`Invalid URL for MCP server: ${serverName}`);
      return false;
    }

    if (serverConfig.headers && typeof serverConfig.headers !== 'object') {
      console.error(`Invalid headers for MCP server: ${serverName}`);
      return false;
    }
  }

  return true;
}