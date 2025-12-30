/**
 * MCP (Model Context Protocol) integration for Kafkasder Management Panel
 * 
 * This module provides comprehensive MCP integration utilities for managing
 * external AI development tools and services.
 * 
 * @example
 * ```typescript
 * import { checkEnvironmentVariables, initializeMCPConfig } from '@/lib/mcp';
 * 
 * // Check if MCP environment is properly configured
 * const { isValid, missing } = checkEnvironmentVariables();
 * 
 * // Initialize MCP for Cursor
 * const result = initializeMCPConfig('cursor');
 * ```
 */

export * from './types';
export * from './utils';

// Re-export commonly used constants for convenience
export {
  MCP_SERVERS,
  SUPPORTED_IDES,
  MCP_SERVER_CONFIGS,
  REQUIRED_ENV_VARS,
  IDE_CONFIGS,
  MCP_USAGE_EXAMPLES
} from './types';