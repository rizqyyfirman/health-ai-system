require('dotenv').config();
const mqtt = require('mqtt');

const broker = `mqtt://${process.env.MQTT_BROKER}:${process.env.MQTT_PORT}`;
const topic = process.env.MQTT_TOPIC;

console.log('🔗 Connecting to:', broker);

const client = mqtt.connect(broker);

client.on('connect', () => {
  console.log('✅ Connected!\n');

  // Test data DENGAN location nested
  const testData = {
    bpm: 75,
    spo2: 98,
    suhu: 36.5,
    gsr: 0.523,
    location: {
      latitude: -7.250445,
      longitude: 112.768845,
      altitude: 15.5,
      satellites: 8
    }
  };

  console.log('📤 Publishing test data:');
  console.log(JSON.stringify(testData, null, 2));

  client.publish(topic, JSON.stringify(testData), (err) => {
    if (err) {
      console.error('❌ Publish error:', err);
    } else {
      console.log('✅ Data published successfully!');
    }
    
    setTimeout(() => {
      client.end();
      console.log('\n🔌 Disconnected');
    }, 1000);
  });
});