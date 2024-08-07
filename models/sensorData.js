const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sensorDataSchema = new Schema({
    sensorId: {
        type: String,  // Schema.Types.ObjectId,
        required: true,
        //ref: 'Sensor'
    },
    timestamp: {
        type: Date,
        required: true
    },
    data: {
        type: Schema.Types.Mixed,
        required: true
    },
    description: {
        type: String
    },
    helperText: {
        type: String
    }
});

module.exports = mongoose.model('SensorData', sensorDataSchema);


