import { Twin } from './twin';
import { TwinId } from '../types';

describe('Twin', () => {
  let twin1: Twin;
  let twin2: Twin;
  
  beforeEach(() => {
    // Criar novas instâncias para cada teste
    twin1 = new Twin('twin-1', { name: 'Twin 1' });
    twin2 = new Twin('twin-2', { name: 'Twin 2' });
  });
  
  afterEach(() => {
    // Limpar manipuladores de eventos após cada teste
    jest.clearAllMocks();
  });
  
  describe('constructor', () => {
    it('deve criar uma nova instância de Twin com os parâmetros fornecidos', () => {
      const twin = new Twin('test-id', { 
        name: 'Test Twin',
        description: 'A test twin',
        version: '1.0.0',
        tags: ['test']
      });
      
      expect(twin.id).toBe('test-id');
      expect(twin.metadata.name).toBe('Test Twin');
      expect(twin.metadata.description).toBe('A test twin');
      expect(twin.metadata.version).toBe('1.0.0');
      expect(twin.metadata.tags).toEqual(['test']);
      expect(twin.state.status).toBe('offline');
    });
    
    it('deve definir valores padrão para metadados não fornecidos', () => {
      const twin = new Twin('test-id');
      
      expect(twin.metadata.name).toBe('Twin-test-id');
      expect(twin.metadata.description).toBe('A TWIN instance');
      expect(twin.metadata.version).toBe('0.1.0');
      expect(twin.metadata.tags).toEqual([]);
      expect(twin.metadata.createdAt).toBeInstanceOf(Date);
      expect(twin.metadata.updatedAt).toBeInstanceOf(Date);
    });
  });
  
  describe('getFullId', () => {
    it('deve retornar o ID completo incluindo o namespace quando disponível', () => {
      const twin = new Twin('test-id', { namespace: 'test-ns' });
      expect(twin.getFullId()).toBe('test-ns:test-id');
    });
    
    it('deve retornar apenas o ID quando não houver namespace', () => {
      const twin = new Twin('test-id');
      expect(twin.getFullId()).toBe('test-id');
    });
  });
  
  describe('connect', () => {
    it('deve estabelecer uma conexão com outro Twin', async () => {
      const connection = await twin1.connect(twin2);
      
      expect(connection.source.id).toBe(twin1.id);
      expect(connection.target.id).toBe(twin2.id);
      expect(connection.type).toBe('peer');
      expect(connection.establishedAt).toBeInstanceOf(Date);
      expect(connection.lastActivity).toBeInstanceOf(Date);
    });
    
    it('deve reutilizar uma conexão existente se já estiver conectado', async () => {
      const connection1 = await twin1.connect(twin2);
      const connection2 = await twin1.connect(twin2);
      
      expect(connection1).toBe(connection2);
    });
  });
  
  describe('sendMessage', () => {
    it('deve enviar uma mensagem para outro Twin', async () => {
      await twin1.connect(twin2);
      
      const testPayload = { message: 'Hello, Twin 2!' };
      const messagePromise = new Promise((resolve) => {
        twin2.on('message:received', (event) => {
          if (event.payload === testPayload) {
            resolve(event);
          }
        });
      });
      
      await twin1.sendMessage(twin2, 'test-message', testPayload);
      
      const receivedEvent = await messagePromise;
      expect(receivedEvent).toBeDefined();
      expect(receivedEvent.source.id).toBe(twin1.id);
      expect(receivedEvent.target.id).toBe(twin2.id);
      expect(receivedEvent.type).toBe('message:received');
      expect(receivedEvent.payload).toEqual(testPayload);
    });
    
    it('deve lançar um erro ao tentar enviar mensagem para um Twin não conectado', async () => {
      await expect(
        twin1.sendMessage(twin2, 'test-message', {})
      ).rejects.toThrow('Not connected to twin-2');
    });
  });
  
  describe('event handling', () => {
    it('deve registrar e chamar manipuladores de eventos', () => {
      const eventHandler = jest.fn();
      const eventType = 'test:event';
      
      // Registrar manipulador
      const unsubscribe = twin1.on(eventType, eventHandler);
      
      // Disparar evento
      const testEvent = {
        id: 'event-1',
        type: eventType,
        timestamp: new Date(),
        source: { id: 'source-id' },
        payload: { test: 'data' }
      };
      
      twin1.emitEvent(testEvent);
      
      // Verificar se o manipulador foi chamado
      expect(eventHandler).toHaveBeenCalledWith(testEvent);
      
      // Testar cancelamento de inscrição
      eventHandler.mockClear();
      unsubscribe();
      
      twin1.emitEvent(testEvent);
      expect(eventHandler).not.toHaveBeenCalled();
    });
  });
  
  describe('disconnect', () => {
    it('deve desconectar de um Twin conectado', async () => {
      await twin1.connect(twin2);
      
      // Verificar se está conectado
      expect(twin1['connections'].size).toBe(1);
      
      // Desconectar
      await twin1.disconnect(twin2);
      
      // Verificar se a conexão foi removida
      expect(twin1['connections'].size).toBe(0);
    });
    
    it('não deve lançar erro ao desconectar de um Twin não conectado', async () => {
      await expect(twin1.disconnect(twin2)).resolves.not.toThrow();
    });
  });
});
