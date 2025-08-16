// Core protocol interfaces and implementations for the TWIN protocol

export * from './twin';
export * from './connection';
export * from './sync';

// Re-export types for convenience
export * from '../types';

// Version information
export const PROTOCOL_VERSION = '0.1.0';
export const SUPPORTED_VERSIONS = ['0.1.0'];

/**
 * Check if a protocol version is supported
 */
export function isVersionSupported(version: string): boolean {
  return SUPPORTED_VERSIONS.includes(version);
}

/**
 * Protocol error codes
 */
export enum ProtocolErrorCode {
  // General errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_MESSAGE = 'INVALID_MESSAGE',
  UNSUPPORTED_VERSION = 'UNSUPPORTED_VERSION',
  UNAUTHORIZED = 'UNAUTHORIZED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Connection errors
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  CONNECTION_TIMEOUT = 'CONNECTION_TIMEOUT',
  CONNECTION_CLOSED = 'CONNECTION_CLOSED',
  
  // Sync errors
  SYNC_FAILED = 'SYNC_FAILED',
  SYNC_CONFLICT = 'SYNC_CONFLICT',
  SYNC_TIMEOUT = 'SYNC_TIMEOUT',
  
  // Data errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  VERSION_CONFLICT = 'VERSION_CONFLICT',
  
  // Command errors
  COMMAND_FAILED = 'COMMAND_FAILED',
  COMMAND_TIMEOUT = 'COMMAND_TIMEOUT',
  COMMAND_NOT_SUPPORTED = 'COMMAND_NOT_SUPPORTED',
}

/**
 * Protocol error class
 */
export class ProtocolError extends Error {
  constructor(
    public code: ProtocolErrorCode,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ProtocolError';
    
    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ProtocolError);
    }
  }
  
  /**
   * Create a ProtocolError from a plain object
   */
  static fromObject(obj: {
    code: ProtocolErrorCode;
    message: string;
    details?: unknown;
  }): ProtocolError {
    return new ProtocolError(obj.code, obj.message, obj.details);
  }
  
  /**
   * Convert error to a plain object for serialization
   */
  toObject() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      name: this.name,
      stack: this.stack,
    };
  }
}

/**
 * Protocol options
 */
export interface ProtocolOptions {
  // Protocol version to use
  version?: string;
  
  // Timeout for operations in milliseconds
  timeout?: number;
  
  // Authentication token (if required)
  authToken?: string;
  
  // Enable/disable debug logging
  debug?: boolean;
  
  // Custom logger implementation
  logger?: {
    debug: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
  };
}

/**
 * Default protocol options
 */
export const DEFAULT_PROTOCOL_OPTIONS: Required<ProtocolOptions> = {
  version: PROTOCOL_VERSION,
  timeout: 30000, // 30 seconds
  authToken: '',
  debug: false,
  logger: {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
  },
};

/**
 * Merge default options with user-provided options
 */
export function mergeOptions(
  defaults: ProtocolOptions,
  overrides?: ProtocolOptions
): Required<ProtocolOptions> {
  if (!overrides) return { ...defaults } as Required<ProtocolOptions>;
  
  const result = { ...defaults, ...overrides } as Required<ProtocolOptions>;
  
  // Deep merge logger if provided
  if (overrides.logger) {
    result.logger = { ...defaults.logger, ...overrides.logger };
  }
  
  return result;
}
