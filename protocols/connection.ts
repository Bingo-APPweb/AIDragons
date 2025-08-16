import { TwinId, TwinConnection as TwinConnectionType } from '../types';
import { ProtocolError, ProtocolErrorCode } from '.';

/**
 * Manages a connection between two TWIN instances
 */
export class TwinConnection implements TwinConnectionType {
  // Connection metadata
  public readonly source: TwinId;
  public readonly target: TwinId;
  public readonly type: 'parent' | 'child' | 'peer' | 'sync';
  public readonly establishedAt: Date;
  public lastActivity: Date;
  
  // Connection state
  private isConnected: boolean = true;
  private pendingMessages: Array<{
    id: string;
    type: string;
    payload: unknown;
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
    timeout: NodeJS.Timeout;
  }> = [];
  
  // Event handlers
  private messageHandlers: Map<string, Array<(payload: unknown) => void>> = new Map();
  
  // Default timeout for messages (in milliseconds)
  private defaultTimeout: number = 30000; // 30 seconds
  
  constructor(params: Omit<TwinConnectionType, 'lastActivity'>) {
    this.source = params.source;
    this.target = params.target;
    this.type = params.type;
    this.establishedAt = params.establishedAt;
    this.lastActivity = new Date();
  }
  
  /**
   * Send a message through this connection
   */
  public send<T = unknown>(
    type: string, 
    payload?: T, 
    options: { timeout?: number } = {}
  ): Promise<unknown> {
    if (!this.isConnected) {
      return Promise.reject(
        new ProtocolError(
          ProtocolErrorCode.CONNECTION_CLOSED,
          'Connection is closed'
        )
      );
    }
    
    const messageId = this.generateMessageId();
    const timeoutMs = options.timeout || this.defaultTimeout;
    
    return new Promise((resolve, reject) => {
      // Set up timeout
      const timeout = setTimeout(() => {
        this.cleanupMessage(messageId);
        reject(
          new ProtocolError(
            ProtocolErrorCode.CONNECTION_TIMEOUT,
            `Message ${type} (${messageId}) timed out after ${timeoutMs}ms`
          )
        );
      }, timeoutMs);
      
      // Store the pending message
      this.pendingMessages.push({
        id: messageId,
        type,
        payload,
        resolve,
        reject,
        timeout,
      });
      
      // In a real implementation, this would send the message over the network
      this.sendOverTransport({
        id: messageId,
        type,
        payload,
        timestamp: new Date(),
      });
    });
  }
  
  /**
   * Handle an incoming message
   */
  public handleMessage(message: {
    id: string;
    type: string;
    payload?: unknown;
    timestamp: Date;
  }): void {
    if (!this.isConnected) return;
    
    this.lastActivity = new Date();
    
    // Check if this is a response to a pending message
    const pendingIndex = this.pendingMessages.findIndex(m => m.id === message.id);
    if (pendingIndex !== -1) {
      const pending = this.pendingMessages[pendingIndex];
      clearTimeout(pending.timeout);
      
      if (message.type === 'error') {
        const error = message.payload as { code: string; message: string };
        pending.reject(
          new ProtocolError(
            error.code as ProtocolErrorCode,
            error.message || 'Unknown error',
            message.payload
          )
        );
      } else {
        pending.resolve(message.payload);
      }
      
      this.pendingMessages.splice(pendingIndex, 1);
      return;
    }
    
    // Not a response to a pending message, so it's a new message
    this.emit('message', message);
    
    // Call any registered handlers for this message type
    const handlers = this.messageHandlers.get(message.type) || [];
    for (const handler of handlers) {
      try {
        handler(message.payload);
      } catch (error) {
        console.error(`Error in message handler for ${message.type}:`, error);
      }
    }
  }
  
  /**
   * Register a message handler
   */
  public onMessage<T = unknown>(
    type: string, 
    handler: (payload: T) => void | Promise<void>
  ): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    
    const handlers = this.messageHandlers.get(type)!;
    handlers.push(handler as (payload: unknown) => void);
    
    // Return unsubscribe function
    return () => {
      const index = handlers.indexOf(handler as (payload: unknown) => void);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    };
  }
  
  /**
   * Close the connection
   */
  public close(): void {
    if (!this.isConnected) return;
    
    this.isConnected = false;
    
    // Reject all pending messages
    for (const message of this.pendingMessages) {
      clearTimeout(message.timeout);
      message.reject(
        new ProtocolError(
          ProtocolErrorCode.CONNECTION_CLOSED,
          'Connection closed before receiving a response'
        )
      );
    }
    
    this.pendingMessages = [];
    this.emit('close');
  }
  
  /**
   * Check if the connection is still active
   */
  public isAlive(): boolean {
    if (!this.isConnected) return false;
    
    // Consider the connection dead if there's been no activity for 2x the default timeout
    const maxInactivity = this.defaultTimeout * 2;
    const now = Date.now();
    const lastActivity = this.lastActivity.getTime();
    
    return (now - lastActivity) < maxInactivity;
  }
  
  // Event emitter implementation
  private eventHandlers: Map<string, Array<(...args: unknown[]) => void>> = new Map();
  
  private emit(event: string, ...args: unknown[]): void {
    const handlers = this.eventHandlers.get(event) || [];
    for (const handler of handlers) {
      try {
        handler(...args);
      } catch (error) {
        console.error(`Error in ${event} handler:`, error);
      }
    }
  }
  
  public on(event: 'message', handler: (message: unknown) => void): void;
  public on(event: 'close', handler: () => void): void;
  public on(event: string, handler: (...args: unknown[]) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }
  
  public off(event: string, handler: (...args: unknown[]) => void): void {
    const handlers = this.eventHandlers.get(event);
    if (!handlers) return;
    
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }
  
  // Private methods
  
  /**
   * Send a message over the transport layer
   */
  private sendOverTransport(message: unknown): void {
    // In a real implementation, this would send the message over the network
    // For now, we'll just log it
    console.debug('Sending message:', message);
    this.lastActivity = new Date();
  }
  
  /**
   * Clean up a pending message by ID
   */
  private cleanupMessage(messageId: string): void {
    const index = this.pendingMessages.findIndex(m => m.id === messageId);
    if (index !== -1) {
      const [message] = this.pendingMessages.splice(index, 1);
      clearTimeout(message.timeout);
    }
  }
  
  /**
   * Generate a unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Format a TwinId as a string for logging
   */
  private formatTwinId(twinId: TwinId): string {
    return twinId.namespace ? `${twinId.namespace}:${twinId.id}` : twinId.id;
  }
}
