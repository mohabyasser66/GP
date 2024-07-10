const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const sensorSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  sensorId: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('UserSensor', sensorSchema);