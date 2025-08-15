import { temporalAnomalyDetector, TemporalAnomaly } from './temporal_anomaly_detector';

describe('TemporalAnomalyDetector', () => {
  // Mock the current date for consistent testing
  const mockNow = new Date('2024-08-15T12:00:00Z').getTime();
  
  beforeAll(() => {
    // Mock Date.now() to return a fixed timestamp
    jest.spyOn(Date, 'now').mockImplementation(() => mockNow);
  });

  afterAll(() => {
    // Restore the original Date.now()
    jest.restoreAllMocks();
  });

  it('should detect future-dated logs as anomalies', async () => {
    const logs = [
      { timestamp: '2024-08-20T12:00:00Z', message: 'Future log (5 days)' },
      { timestamp: '2024-08-15T12:00:00Z', message: 'Current time' },
      { timestamp: '2025-08-15T12:00:00Z', message: 'Distant future log' }
    ];

    const anomalies = await temporalAnomalyDetector.scan(logs);
    
    expect(anomalies).toHaveLength(2);
    expect(anomalies[0].severity).toBe('curious'); // 5 days in future
    expect(anomalies[1].severity).toBe('transcendental'); // 1 year in future
  });

  it('should interpret project update messages correctly', async () => {
    const logs = [
      { 
        timestamp: '2025-08-15T13:45:33+02:00',
        message: 'Updates project\'s content',
        actor: null,
        action: null,
        target: null
      }
    ];

    const anomalies = await temporalAnomalyDetector.scan(logs);
    expect(anomalies[0].interpretation).toContain('The Tree is updating itself');
  });

  it('should assign correct dragons based on time delta', async () => {
    const logs = [
      { timestamp: '2024-08-16T12:00:00Z', message: '1 day' }, // Chronos
      { timestamp: '2024-08-22T12:00:00Z', message: '7 days' }, // Quantum
      { timestamp: '2025-08-15T12:00:00Z', message: '1 year' }  // Oracle
    ];

    const anomalies = await temporalAnomalyDetector.scan(logs);
    
    expect(anomalies[0].dragonAlert).toContain('Chronos');
    expect(anomalies[1].dragonAlert).toContain('Quantum');
    expect(anomalies[2].dragonAlert).toContain('Oracle');
  });

  it('should not flag past or current timestamps as anomalies', async () => {
    const logs = [
      { timestamp: '2024-08-14T12:00:00Z', message: 'Yesterday' },
      { timestamp: '2024-08-15T11:59:59Z', message: '1 second ago' },
      { timestamp: '2024-08-15T12:00:00Z', message: 'Now' }
    ];

    const anomalies = await temporalAnomalyDetector.scan(logs);
    expect(anomalies).toHaveLength(0);
  });
});
