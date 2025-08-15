// src/examples/temporal_anomaly_example.ts
import { temporalAnomalyDetector } from '../weather/sensors/temporal_anomaly_detector';

/**
 * Example demonstrating the Temporal Anomaly Detector
 * 
 * This example shows how to use the detector with sample log data
 * that includes past, present, and future-dated entries.
 */

async function runExample() {
  console.log('🌌 Starting Temporal Anomaly Detection Example');
  
  // Sample log data with various timestamps
  const logs = [
    // Past logs (should not trigger)
    { 
      timestamp: '2024-08-14T12:00:00Z', 
      message: 'System startup completed',
      actor: 'system',
      action: 'startup',
      target: 'all_services'
    },
    
    // Current time log (should not trigger)
    { 
      timestamp: new Date().toISOString(),
      message: 'Current system status',
      status: 'operational',
      load: '42%'
    },
    
    // Future logs (should trigger anomalies)
    { 
      timestamp: '2024-08-20T12:00:00Z',
      message: 'Scheduled maintenance',
      type: 'maintenance',
      duration: '2h'
    },
    
    // Far future log (should trigger high severity)
    { 
      timestamp: '2025-08-15T13:45:33+02:00',
      message: 'Updates project\'s content',
      actor: null,
      action: null,
      target: null
    },
    
    // Another future log
    { 
      timestamp: '2024-09-15T09:30:00Z',
      message: 'Quarterly report generated',
      type: 'report',
      format: 'pdf'
    }
  ];

  console.log('🔍 Scanning logs for temporal anomalies...');
  const anomalies = await temporalAnomalyDetector.scan(logs);
  
  console.log(`\n📊 Found ${anomalies.length} temporal anomalies:`);
  console.log('='.repeat(60));
  
  anomalies.forEach((anomaly, index) => {
    const daysInFuture = Math.floor(anomaly.deltaFromNow / (1000 * 60 * 60 * 24));
    console.log(`\n🕒 Anomaly #${index + 1}:`);
    console.log(`   Timestamp: ${anomaly.timestamp}`);
    console.log(`   In the future by: ${daysInFuture} days`);
    console.log(`   Severity: ${anomaly.severity.toUpperCase()}`);
    console.log(`   Dragon Alert: ${anomaly.dragonAlert}`);
    console.log(`   Interpretation: ${anomaly.interpretation}`);
    console.log(`   Log Message: ${anomaly.logEntry?.message || 'N/A'}`);
    console.log('   ' + '-'.repeat(50));
  });
  
  console.log('\n✨ Example completed!');
}

// Run the example
runExample().catch(console.error);
