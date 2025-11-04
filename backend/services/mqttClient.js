const mqtt = require('mqtt');

class MQTTClient {
  constructor() {
    this.client = null;
    this.latestData = null;
    this.dataCallback = null;
    this.connect();
  }

  connect() {
    const broker = `mqtt://${process.env.MQTT_BROKER}:${process.env.MQTT_PORT}`;
    
    this.client = mqtt.connect(broker, {
      clientId: `health_monitor_${Math.random().toString(16).slice(2, 8)}`,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
    });

    this.client.on('connect', () => {
      console.log('✅ MQTT Connected to', broker);
      this.client.subscribe(process.env.MQTT_TOPIC, (err) => {
        if (err) {
          console.error('❌ MQTT Subscribe error:', err);
        } else {
          console.log('📡 Subscribed to topic:', process.env.MQTT_TOPIC);
        }
      });
    });

    this.client.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('📩 MQTT Raw data:', JSON.stringify(data, null, 2));

        // Validate required fields
        if (data.bpm && data.spo2 && data.suhu && data.gsr) {
          
          // PARSE LOCATION - Support nested object
          let locationData = null;
          
          if (data.location) {
            // Format 1: {"location": {"latitude": -7.25, "longitude": 112.76}}
            if (data.location.latitude && data.location.longitude) {
              locationData = {
                latitude: parseFloat(data.location.latitude),
                longitude: parseFloat(data.location.longitude),
                altitude: data.location.altitude ? parseFloat(data.location.altitude) : null,
                satellites: data.location.satellites ? parseInt(data.location.satellites) : null,
                accuracy: data.location.accuracy ? parseFloat(data.location.accuracy) : null
              };
            }
          } else if (data.latitude && data.longitude) {
            // Format 2: {"latitude": -7.25, "longitude": 112.76}
            locationData = {
              latitude: parseFloat(data.latitude),
              longitude: parseFloat(data.longitude),
              altitude: data.altitude ? parseFloat(data.altitude) : null,
              satellites: data.satellites ? parseInt(data.satellites) : null,
              accuracy: data.accuracy ? parseFloat(data.accuracy) : null
            };
          }

          this.latestData = {
            bpm: parseInt(data.bpm),
            spo2: parseFloat(data.spo2),
            suhu: parseFloat(data.suhu),
            gsr: parseFloat(data.gsr),
            location: locationData,
            timestamp: new Date()
          };

          console.log('✅ Data processed:', JSON.stringify(this.latestData, null, 2));

          // Emit to Socket.IO
          if (global.io) {
            global.io.emit('sensor-data', this.latestData);
          }

          // Call callback
          if (this.dataCallback) {
            this.dataCallback(this.latestData);
          }
        } else {
          console.warn('⚠️ Incomplete data:', data);
        }
      } catch (error) {
        console.error('❌ MQTT Parse error:', error.message);
        console.error('Raw message:', message.toString());
      }
    });

    this.client.on('error', (error) => {
      console.error('❌ MQTT Error:', error.message);
    });

    this.client.on('offline', () => {
      console.warn('⚠️ MQTT Offline - Reconnecting...');
    });

    this.client.on('reconnect', () => {
      console.log('🔄 MQTT Reconnecting...');
    });
  }

  // Method untuk set callback (FIX ERROR)
  setDataCallback(callback) {
    this.dataCallback = callback;
    console.log('✅ MQTT Callback registered');
  }

  getLatestData() {
    return this.latestData;
  }

  disconnect() {
    if (this.client) {
      this.client.end();
      console.log('🔌 MQTT Disconnected');
    }
  }
}

module.exports = new MQTTClient();