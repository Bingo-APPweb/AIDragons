import { TwinConnection } from './connection';
import { ProtocolError, ProtocolErrorCode } from '.';

describe('TwinConnection', () => {
  let connection: TwinConnection;
  const source = { id: 'source-twin' };
  const target = { id: 'target-twin' };
  
  beforeEach(() => {
    connection = new TwinConnection({
      source,
      target,
      type: 'peer',
      establishedAt: new Date()
    });
  });
  
  afterEach(() => {
    // Fechar a conexão após cada teste
    connection.close();
    jest.clearAllMocks();
  });
  
  describe('constructor', () => {
    it('deve criar uma nova instância de conexão com os parâmetros fornecidos', () => {
      const now = new Date();
      const connection = new TwinConnection({
        source,
        target,
        type: 'parent', // Testando um tipo diferente
        establishedAt: now
      });
      
      expect(connection.source).toEqual(source);
      expect(connection.target).toEqual(target);
      expect(connection.type).toBe('parent');
      expect(connection.establishedAt).toBe(now);
      expect(connection.lastActivity).toBeInstanceOf(Date);
    });
  });
  
  describe('send', () => {
    it('deve enviar uma mensagem e receber uma resposta', async () => {
      // Configurar manipulador de mensagens
      const messageHandler = jest.fn((message) => {
        if (message.type === 'test-request') {
          connection['handleMessage']({
            id: 'response-1',
            type: 'test-response',
            payload: { success: true },
            timestamp: new Date()
          });
        }
      });
      
      // Simular envio de mensagem
      const sendSpy = jest.spyOn(connection as any, 'sendOverTransport');
      
      // Enviar mensagem
      const response = connection.send('test-request', { data: 'test' });
      
      // Verificar se a mensagem foi enviada
      expect(sendSpy).toHaveBeenCalledWith({
        id: expect.any(String),
        type: 'test-request',
        payload: { data: 'test' },
        timestamp: expect.any(Date)
      });
      
      // Verificar se a resposta foi recebida corretamente
      await expect(response).resolves.toEqual({ success: true });
    });
    
    it('deve rejeitar com erro de tempo limite se a resposta não for recebida', async () => {
      // Reduzir o tempo limite para o teste
      connection['defaultTimeout'] = 100;
      
      // Enviar mensagem sem configurar um manipulador para responder
      await expect(
        connection.send('test-timeout', {})
      ).rejects.toThrow(ProtocolError);
    }, 1000); // Aumentar o timeout do teste para garantir que o timeout interno seja acionado
    
    it('deve rejeitar com erro se a conexão estiver fechada', async () => {
      connection.close();
      
      await expect(
        connection.send('test-message', {})
      ).rejects.toThrow('Connection is closed');
    });
  });
  
  describe('handleMessage', () => {
    it('deve processar mensagens recebidas', () => {
      const messageHandler = jest.fn();
      connection.on('message', messageHandler);
      
      const testMessage = {
        id: 'msg-1',
        type: 'test-message',
        payload: { test: 'data' },
        timestamp: new Date()
      };
      
      connection['handleMessage'](testMessage);
      
      expect(messageHandler).toHaveBeenCalledWith(testMessage);
    });
    
    it('deve processar respostas para mensagens pendentes', () => {
      const responsePromise = connection.send('test-request', { requestId: '123' });
      
      const responseMessage = {
        id: 'response-1',
        type: 'test-response',
        payload: { success: true },
        timestamp: new Date()
      };
      
      // Simular resposta
      connection['handleMessage'](responseMessage);
      
      return expect(responsePromise).resolves.toEqual({ success: true });
    });
    
    it('deve processar erros recebidos como resposta', () => {
      const responsePromise = connection.send('test-request', { requestId: '123' });
      
      const errorResponse = {
        id: 'error-1',
        type: 'error',
        payload: {
          code: 'TEST_ERROR',
          message: 'Test error message'
        },
        timestamp: new Date()
      };
      
      // Simular erro
      connection['handleMessage'](errorResponse);
      
      return expect(responsePromise).rejects.toThrow('Test error message');
    });
  });
  
  describe('onMessage', () => {
    it('deve registrar manipuladores de mensagens específicas', () => {
      const messageHandler = jest.fn();
      const unsubscribe = connection.onMessage('test-message', messageHandler);
      
      // Enviar mensagem do tipo correto
      connection['handleMessage']({
        id: 'msg-1',
        type: 'test-message',
        payload: { test: 'data' },
        timestamp: new Date()
      });
      
      expect(messageHandler).toHaveBeenCalledWith({ test: 'data' });
      
      // Testar cancelamento de inscrição
      messageHandler.mockClear();
      unsubscribe();
      
      connection['handleMessage']({
        id: 'msg-2',
        type: 'test-message',
        payload: { test: 'data' },
        timestamp: new Date()
      });
      
      expect(messageHandler).not.toHaveBeenCalled();
    });
  });
  
  describe('close', () => {
    it('deve fechar a conexão e rejeitar mensagens pendentes', async () => {
      const responsePromise = connection.send('test-request', {});
      
      // Fechar conexão antes de receber resposta
      connection.close();
      
      await expect(responsePromise).rejects.toThrow('Connection closed before receiving a response');
      
      // Tentar enviar nova mensagem
      await expect(
        connection.send('test-message', {})
      ).rejects.toThrow('Connection is closed');
    });
    
    it('deve emitir evento de fechamento', () => {
      const closeHandler = jest.fn();
      connection.on('close', closeHandler);
      
      connection.close();
      
      expect(closeHandler).toHaveBeenCalled();
    });
  });
  
  describe('isAlive', () => {
    it('deve retornar true se a conexão estiver ativa', () => {
      expect(connection.isAlive()).toBe(true);
    });
    
    it('deve retornar false se a conexão estiver fechada', () => {
      connection.close();
      expect(connection.isAlive()).toBe(false);
    });
    
    it('deve retornar false se a conexão estiver inativa', () => {
      // Definir lastActivity para um tempo muito antigo
      connection['lastActivity'] = new Date(Date.now() - 1000000);
      expect(connection.isAlive()).toBe(false);
    });
  });
});
