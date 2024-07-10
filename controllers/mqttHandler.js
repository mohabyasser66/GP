// const mqtt = require('mqtt');
// const request = require("request");

// const brokerUrl = 'mqtt://localhost';      //'mqtt://192.168.1.107';
// const topics = ["flame/sensor", "gas/sensor", "pir/sensor"];



// const client = mqtt.connect(brokerUrl);
// client.on('connect', () => {
//   console.log('Connected to MQTT broker');
//   for (const topic of topics) {
//       client.subscribe(topic, (err) => {
//         if (err) {
//           console.error('Subscription error:', err);
//         } else {
//           console.log(`Subscribed to topic: ${topic}`);
//         }
//       });
//   }
// });

// client.on('message', (topic,message) => {
//   if(topic === 'flame/sensor'){
//     let message = {
//         to: 'dqMZCezmSJqbpPAVgTsG9v:APA91bHjiCtTEFr9iVqr3ELlcSkJJHjOYM5Z6Z04yaazbAEZ0nulyI5pj5imK-YKF80p-XOYQPsPupCS8BH55lwlvl0xOc7qT9BfniB7-CA_-x2Mk2mk7Qkzb_0apWpdms-XYLHddlmF',
//         notification: {
//           title: "Notification",
//           body: 'This is a Test Notification'
//         },
//       };
//     function sendNotification(message){
//       let clientServerOptions = {
//         uri: 'https://fcm.googleapis.com/fcm/send',
//         method: 'POST',
//         body: JSON.stringify(message),
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': 'key=AAAAEx2Gzqo:APA91bGNeVCLxP6iKFra3Ttit3X_OI53TM3Xr3mcdhThq0dM7O5AUkdy4d0vzFHnanrQeOh5vlsPA52w-8JObkQwhtDQw47NCNaYKXF8-DFf65H42MUaYjc5PehWcMWmVpMR0R70DkMK'
//         }
//       }
//       request(clientServerOptions, function(error,res){
//         console.log(error, res.body);
//       });
//     }
//     sendNotification(message);
//   }
//   try {
//       const messages = message.toString();
//       const data = messages.split(' ')[0];
//       const id = messages.split(' ')[1];
//       const sensorData = new SensorData({
//           data: data,
//           timestamp: Date.now(),
//           sensorId: id
//       });
      
//       sensorData.save().then( () => {
//           console.log(`Received message on topic ${topic}: ${message.toString()}`);
//       }).catch( (err) => console.log('Error saving sensor data:', err));
//   }
//   catch (error) {
//         console.error('Error processing MQTT message:', error);
//   }
// });

// client.on('error', (error) => {
//   console.error('Error:', error);
// });