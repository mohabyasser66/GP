// const mqtt = require('mqtt');

// const topics = ["buzzer/control"];


// const client = mqtt.connect("mqtt://localhost");
// client.on('connect', () => {
//   console.log('Connected to MQTT broker');
// });

// client.publish("buzzer/control", "Send Buzz", (err) => {
//     if (err) {
//         console.error('Failed to publish MQTT message:', err);
//         return res.status(500).json({ error: 'Failed to send notification' });
//     }
//     console.log(`Published buzz notification.`);
// });

// client.on('error', (error) => {
//   console.error('Error:', error);
// });