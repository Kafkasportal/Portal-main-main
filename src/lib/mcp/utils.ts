/**
 * MCP (Model Context Protocol) utilities for the Kafkasder Management Panel
 * 
 * This module provides utilities for managing MCP server configurations
 * and integrating with various AI development environments.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import {
  MCPConfig,
  MCPServerType,
  SupportedIDE,
  EnvironmentVariable,
  IDE_CONFIGS,
  REQUIRED_ENV_VARS,
  MCP_SERVER_CONFIGS,
  validateMCPConfig
} from './types';

/**
 * Get the project root directory
 */
export function getProjectRoot(): string {
  // Start from current directory and walk up until we find package.json
  let current = process.cwd();
  while (current !== dirname(current)) {
    if (existsSync(join(current, 'package.json'))) {
      return current;
    }
    current = dirname(current);
  }
  return process.cwd();
}

/**
 * Get platform-specific paths for IDE configurations
 */
export function getIDEConfigPath(ide: SupportedIDE): string {
  const projectRoot = getProjectRoot();
  const config = IDE_CONFIGS[ide];

  switch (ide) {
    case 'claude-desktop':
      const platform = process.platform;
      if (platform === 'darwin') {
        return join(homedir(), 'Library/Application Support/Claude/claude_desktop_config.json');
      } else if (platform === 'win32') {
        return join(process.env.APPDATA || '', 'Claude/claude_desktop_config.json');
      } else {
        return join(homedir(), '.claude/claude_desktop_config.json');
      }

    case 'windsurf':
      return join(homedir(), '.codeium/windsurf/mcp_config.json');

    default:
      return join(projectRoot, config.file);
  }
}

/**
 * Check if required environment variables are set
 */
export function checkEnvironmentVariables(): {
  isValid: boolean;
  missing: EnvironmentVariable[];
  warnings: EnvironmentVariable[];
} {
  const projectRoot = getProjectRoot();
  const envPath = join(projectRoot, '.env.local');

  let envContent = '';
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf8');
  }

  const missing: EnvironmentVariable[] = [];
  const warnings: EnvironmentVariable[] = [];

  for (const envVar of REQUIRED_ENV_VARS) {
    const isSet = process.env[envVar.name] || envContent.includes(`${envVar.name}=`);

    if (!isSet) {
      if (envVar.optional) {
        warnings.push(envVar);
      } else {
        missing.push(envVar);
      }
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings
  };
}

/**
 * Initialize MCP configuration for a specific IDE
 */
export function initializeMCPConfig(ide: SupportedIDE): {
  success: boolean;
  message: string;
} {
  try {
    const config = IDE_CONFIGS[ide];
    const configPath = getIDEConfigPath(ide);
    const configDir = dirname(configPath);

    // Create directory if it doesn't exist
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }

    // Handle VS Code settings merge
    if (ide === 'vscode' && existsSync(configPath)) {
      try {
        const existing = JSON.parse(readFileSync(configPath, 'utf8'));
        const merged = { ...existing, ...config.template };
        writeFileSync(configPath, JSON.stringify(merged, null, 2));
        return {
          success: true,
          message: `Updated MCP configuration: ${config.file}`
        };
      } catch (error) {
        return {
          success: false,
          message: `Error updating VS Code settings: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }

    // Create or overwrite configuration
    writeFileSync(configPath, JSON.stringify(config.template, null, 2));

    return {
      success: true,
      message: `Created MCP configuration: ${config.file}`
    };
  } catch (error) {
    return {
      success: false,
      message: `Error initializing MCP config: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Load and validate an MCP configuration file
 */
export function loadMCPConfig(filePath: string): {
  isValid: boolean;
  config?: MCPConfig;
  error?: string;
} {
  try {
    if (!existsSync(filePath)) {
      return {
        isValid: false,
        error: 'Configuration file does not exist'
      };
    }

    const content = readFileSync(filePath, 'utf8');
    const config = JSON.parse(content) as MCPConfig;

    const isValid = validateMCPConfig(config);

    return {
      isValid,
      config: isValid ? config : undefined,
      error: isValid ? undefined : 'Invalid configuration format'
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error parsing configuration'
    };
  }
}

/**
 * Get available MCP servers for the project
 */
export function getAvailableMCPServers(): MCPServerType[] {
  return Object.keys(MCP_SERVER_CONFIGS) as MCPServerType[];
}

/**
 * Generate MCP configuration for specific servers
 */
export function generateMCPConfig(servers: MCPServerType[]): MCPConfig {
  const mcpServers: Record<string, any> = {};

  for (const server of servers) {
    if (MCP_SERVER_CONFIGS[server]) {
      mcpServers[server] = MCP_SERVER_CONFIGS[server];
    }
  }

  return { mcpServers };
}

/**
 * Check if a specific MCP server is configured
 */
export function isMCPServerConfigured(ide: SupportedIDE, server: MCPServerType): boolean {
  const configPath = getIDEConfigPath(ide);
  const { isValid, config } = loadMCPConfig(configPath);

  if (!isValid || !config) {
    return false;
  }

  return server in config.mcpServers;
}

/**
 * Get MCP server status for all IDEs
 */
export function getMCPStatus(): Record<SupportedIDE, {
  configured: boolean;
  servers: MCPServerType[];
  configPath: string;
}> {
  const status: Record<string, any> = {};

  for (const ide of Object.keys(IDE_CONFIGS) as SupportedIDE[]) {
    const configPath = getIDEConfigPath(ide);
    const { isValid, config } = loadMCPConfig(configPath);

    status[ide] = {
      configured: isValid,
      servers: isValid && config ? Object.keys(config.mcpServers) as MCPServerType[] : [],
      configPath
    };
  }

  return status as Record<SupportedIDE, {
    configured: boolean;
    servers: MCPServerType[];
    configPath: string;
  }>;
}