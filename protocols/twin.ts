import { TwinId, TwinMetadata, TwinState, TwinConnection, TwinEvent } from '../types';
import { ProtocolOptions, ProtocolError, ProtocolErrorCode, DEFAULT_PROTOCOL_OPTIONS } from '.';
import { schemaValidator } from '../utils';

/**
 * Represents a TWIN instance in the network
 */
export class Twin {
  // Twin identity and metadata
  public readonly id: string;
  public readonly namespace?: string;
  public metadata: TwinMetadata;
  public state: TwinState;
  
  // Connections to other TWINs
  protected connections: Map<string, TwinConnection> = new Map();
  
  // Event handlers
  private eventHandlers: Map<string, Array<(event: TwinEvent) => void>> = new Map();
  
  // Protocol options
  protected options: Required<ProtocolOptions>;
  
  constructor(
    id: string,
    metadata: Partial<TwinMetadata> = {},
    options: ProtocolOptions = {}
  ) {
    // Set up basic identity
    this.id = id;
    this.namespace = metadata.namespace;
    
    // Merge default metadata with provided values
    const now = new Date();
    this.metadata = {
      name: `Twin-${id}`,
      description: 'A TWIN instance',
      version: '0.1.0',
      tags: [],
      createdAt: now,
      updatedAt: now,
      ...metadata,
    };
    
    // Set initial state
    this.state = {
      status: 'offline',
      lastSync: undefined,
      error: undefined,
    };
    
    // Merge options with defaults
    this.options = {
      ...DEFAULT_PROTOCOL_OPTIONS,
      ...options,
    };
    
    this.log('debug', `Twin ${this.getFullId()} initialized`);
  }
  
  /**
   * Get the full ID including namespace (if any)
   */
  public getFullId(): string {
    return this.namespace ? `${this.namespace}:${this.id}` : this.id;
  }
  
  /**
   * Connect to another TWIN
   */
  public async connect(target: Twin | TwinId): Promise<TwinConnection> {
    const targetId = this.normalizeTwinId(target);
    const connectionId = this.getConnectionId(targetId);
    
    // Check if already connected
    if (this.connections.has(connectionId)) {
      return this.connections.get(connectionId)!;
    }
    
    this.log('info', `Connecting to ${this.formatTwinId(targetId)}`);
    
    try {
      // In a real implementation, this would establish a network connection
      const now = new Date();
      const connection: TwinConnection = {
        source: { id: this.id, namespace: this.namespace },
        target: targetId,
        type: 'peer',
        establishedAt: now,
        lastActivity: now,
      };
      
      // Store the connection
      this.connections.set(connectionId, connection);
      
      // Emit connection event
      this.emitEvent({
        id: this.generateEventId(),
        type: 'connection:established',
        timestamp: now,
        source: { id: this.id, namespace: this.namespace },
        target: targetId,
        payload: { connection },
      });
      
      this.log('info', `Connected to ${this.formatTwinId(targetId)}`);
      return connection;
    } catch (error) {
      this.log('error', `Failed to connect to ${this.formatTwinId(targetId)}: ${error}`);
      throw new ProtocolError(
        ProtocolErrorCode.CONNECTION_FAILED,
        `Failed to connect to ${this.formatTwinId(targetId)}`,
        { cause: error }
      );
    }
  }
  
  /**
   * Disconnect from a TWIN
   */
  public async disconnect(target: Twin | TwinId): Promise<void> {
    const targetId = this.normalizeTwinId(target);
    const connectionId = this.getConnectionId(targetId);
    
    if (!this.connections.has(connectionId)) {
      return; // Already disconnected
    }
    
    const connection = this.connections.get(connectionId)!;
    
    try {
      this.log('info', `Disconnecting from ${this.formatTwinId(targetId)}`);
      
      // In a real implementation, this would close the network connection
      this.connections.delete(connectionId);
      
      // Emit disconnection event
      this.emitEvent({
        id: this.generateEventId(),
        type: 'connection:closed',
        timestamp: new Date(),
        source: { id: this.id, namespace: this.namespace },
        target: targetId,
        payload: { connection },
      });
      
      this.log('info', `Disconnected from ${this.formatTwinId(targetId)}`);
    } catch (error) {
      this.log('error', `Error disconnecting from ${this.formatTwinId(targetId)}: ${error}`);
      throw error;
    }
  }
  
  /**
   * Send a message to another TWIN
   */
  public async sendMessage<T = unknown>(
    target: Twin | TwinId,
    type: string,
    payload?: T,
    options: { timeout?: number } = {}
  ): Promise<void> {
    const targetId = this.normalizeTwinId(target);
    const connectionId = this.getConnectionId(targetId);
    
    // Check if connected
    if (!this.connections.has(connectionId)) {
      throw new ProtocolError(
        ProtocolErrorCode.CONNECTION_FAILED,
        `Not connected to ${this.formatTwinId(targetId)}`
      );
    }
    
    const connection = this.connections.get(connectionId)!;
    const messageId = this.generateMessageId();
    
    this.log('debug', `Sending message to ${this.formatTwinId(targetId)}: ${type} (${messageId})`);
    
    try {
      // In a real implementation, this would send the message over the network
      const message = {
        id: messageId,
        type,
        timestamp: new Date(),
        source: { id: this.id, namespace: this.namespace },
        target: targetId,
        payload,
      };
      
      // Update last activity
      connection.lastActivity = new Date();
      
      // Emit message sent event
      this.emitEvent({
        id: this.generateEventId(),
        type: 'message:sent',
        timestamp: new Date(),
        source: { id: this.id, namespace: this.namespace },
        target: targetId,
        payload: { message },
      });
      
      this.log('debug', `Message sent to ${this.formatTwinId(targetId)}: ${type} (${messageId})`);
    } catch (error) {
      this.log('error', `Failed to send message to ${this.formatTwinId(targetId)}: ${error}`);
      throw new ProtocolError(
        ProtocolErrorCode.CONNECTION_FAILED,
        `Failed to send message to ${this.formatTwinId(targetId)}`,
        { cause: error }
      );
    }
  }
  
  /**
   * Register an event handler
   */
  public on(eventType: string, handler: (event: TwinEvent) => void): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    
    const handlers = this.eventHandlers.get(eventType)!;
    handlers.push(handler);
    
    // Return unsubscribe function
    return () => {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    };
  }
  
  /**
   * Emit an event to all registered handlers
   */
  protected emitEvent(event: TwinEvent): void {
    const handlers = this.eventHandlers.get(event.type) || [];
    
    // Also call wildcard handlers
    const wildcardHandlers = this.eventHandlers.get('*') || [];
    const allHandlers = [...handlers, ...wildcardHandlers];
    
    if (allHandlers.length === 0) return;
    
    this.log('debug', `Emitting event: ${event.type} (${event.id})`);
    
    // Call handlers asynchronously
    Promise.all(
      allHandlers.map(handler => 
        Promise.resolve().then(() => handler(event)).catch(error => {
          this.log('error', `Error in event handler for ${event.type}: ${error}`);
        })
      )
    ).catch(() => {
      // Ignore errors in the Promise.all handler
    });
  }
  
  /**
   * Normalize a Twin or TwinId to a TwinId
   */
  protected normalizeTwinId(twin: Twin | TwinId): TwinId {
    if (twin instanceof Twin) {
      return { 
        id: twin.id, 
        namespace: twin.namespace 
      };
    }
    return twin;
  }
  
  /**
   * Generate a unique connection ID for a pair of TWINs
   */
  protected getConnectionId(twinId: TwinId): string {
    const parts = [
      this.namespace || '',
      this.id,
      twinId.namespace || '',
      twinId.id,
    ];
    
    return parts.join('::');
  }
  
  /**
   * Generate a unique event ID
   */
  protected generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Generate a unique message ID
   */
  protected generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Format a TwinId for logging
   */
  protected formatTwinId(twinId: TwinId): string {
    return twinId.namespace ? `${twinId.namespace}:${twinId.id}` : twinId.id;
  }
  
  /**
   * Log a message using the configured logger
   */
  protected log(level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: unknown[]): void {
    if (!this.options.debug && level === 'debug') return;
    
    const logger = this.options.logger;
    const logMessage = `[${this.getFullId()}] ${message}`;
    
    switch (level) {
      case 'debug':
        logger.debug(logMessage, ...args);
        break;
      case 'info':
        logger.info(logMessage, ...args);
        break;
      case 'warn':
        logger.warn(logMessage, ...args);
        break;
      case 'error':
        logger.error(logMessage, ...args);
        break;
    }
  }
}
