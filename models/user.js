const mongoose = require('mongoose');
const sensor = require('./sensor');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name:{
      type:String,
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    sensors: [
        {
          sensorId: {
            type: Schema.Types.ObjectId,
            ref: 'Sensor',
          },
          quantity: { type: Number}
        }
        
    ],
    homeFriends: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
});


userSchema.methods.addHomeFriend = function(homeFriendId) {
  homeFriendIndex = this.homeFriends.findIndex(hm => {
    return hm._id.toString() === homeFriendId.toString();
  });
  if(homeFriendIndex >=0){
    console.log("Home Friend already exist");
  }else{
    this.homeFriends.push(homeFriendId);
    return this.save();
  }
};



userSchema.methods.removeHomeFriend = function(homeFriendId) {
  const updatedHomeFriends = this.homeFriends.filter(hm => {
    return hm._id.toString() !== homeFriendId.toString();
  });
  this.homeFriends = updatedHomeFriends;
  return this.save();
};



userSchema.methods.addSensor = function(sensorId) {
  const sensorIndex = this.sensors.findIndex(s => {
    return s.sensorId.toString() === sensorId.toString();
  });
  let newQuantity = 1;
  const updatedSensors = [...this.sensors];

  if(sensorIndex >=0){
      newQuantity = this.sensors[sensorIndex].quantity + 1;
      updatedSensors[sensorIndex].quantity = newQuantity;
    }
  else{
    updatedSensors.push({
      sensorId: sensorId,
      quantity: newQuantity
    });
  }
  this.sensors = updatedSensors;
  return this.save();
};

userSchema.methods.removeSensor = function(sensorId){
  const updatedSensors = this.sensors.filter(sensor => {
    return sensor.sensorId.toString() !== sensorId.toString();
  });
  this.sensors = updatedSensors;
  return this.save();
}

module.exports = mongoose.model('User', userSchema);