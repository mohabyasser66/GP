const User = require('../models/user');
const UserSensors = require('../models/userSensors');
const SensorData = require('../models/sensorData');
const request = require('request');



exports.getHomefriends = async (req, res, next) => {
  let hf = [];
  const user = await User.findById(req.body.userId);
    if(!user){
      const error = new Error('A user with this email could not be found');
      error.statusCode = 401;
      throw error;
    }
    user.populate('homeFriends').then(ha => {
      for(let i in user.homeFriends){
        hf[i] = user.homeFriends[i].name;
      }
      res.status(200).json({
        message: 'Home Friends Fetched.',
        homeFriends : hf
      });
    })
    .catch( err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.postAddHomeFriend = async (req,res,next) => {
    const friendId = req.body.friendId;
    const user = await User.findById(req.body.userId);
    if(!user){
      const error = new Error('A user with this email could not be found');
      error.statusCode = 404;
      throw error;
    }
    try{
      // await user.addHomeFriend(friendId);
      const homeFriendIndex = user.homeFriends.findIndex(hm => {
        return hm.toString() === friendId.toString();
      });
      if(homeFriendIndex >=0){
        const error = new Error('Home Friend already exist');
        error.statusCode = 403;
        throw error;
      }else{
        user.homeFriends.push(friendId);
        await user.save();
      }
      res.status(201).json({
          message: 'Home friend added.'
      });
    }
    catch(err){
      if(!err.statusCode){
        err.statusCode = 500;
      }
      next(err);
    }
}

exports.postDeleteHomeFriend = async (req,res,next) => {
  const friendId = req.body.friendId;
  const user = await User.findById(req.body.userId);
    if(!user){
      const error = new Error('A user with this email could not be found');
      error.statusCode = 401;
      throw error;
    }
  // await user.removeHomeFriend(friendId);
  const updatedHomeFriends = user.homeFriends.filter(hm => {
    return hm._id.toString() !== friendId.toString();
  });
  user.homeFriends = updatedHomeFriends;
  await user.save();
  res.status(200).json({
      message: 'Home friend removed.'
  });
}

exports.postaddSensor = async (req,res,next) => {
  const user = await User.findById(req.body.userId);
  if(!user){
    const error = new Error('A user with this email could not be found');
    error.statusCode = 401;
    throw error;
  }
  try{
    const usersensor = new UserSensors({
      title: req.body.title,
      userId: req.body.userId,
      sensorId: req.body.sensorId
    })
    await usersensor.save();
    user.sensors.push({sensorId: req.body.sensorId});
    await user.save();
    res.status(200).json({
      message: "Sensor Added."
    });
  }
  catch(err){
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  }
  
}

exports.postdeleteSensor = async (req,res,next) => {
  const sensorId = req.body.sensorId;
  const sensor = await UserSensors.findOne({ sensorId: sensorId });
  // if(req.userId !== sensor.userId.toString()){
  //   return res.status(404).json({
  //     message: "not your sensor"
  //   });
  // }
  const user = await User.findById(req.body.userId);
  if(!user){
    const error = new Error('A user with this email could not be found');
    error.statusCode = 401;
    throw error;
  }
  try{
    const sensor = await UserSensors.findOne({sensorId: sensorId});
    await sensor.deleteOne();
    await user.removeSensor(sensorId);
    res.status(200).json({
      message:"Sensor Deleted."
    });
  }
  catch(err){
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  }
 
}

exports.getSensorData = async (req,res,next) => {
  const sensorId = req.body.sensorId;
  // const sensor = await UserSensors.findOne({ sensorId: sensorId });
  const allData = await SensorData.find({sensorId : sensorId });
  res.status(200).json({
    data: allData
  });
  // if(req.userId === sensor.userId.toString()){
  //   const allData = await SensorData.find({sensorId : sensorId });
  //   res.status(200).json({
  //     data: allData
  //   });
  // }
  // else{
  //   res.status(401).json({
  //     message: 'Not your sensor'
  //   });
  // }
}

exports.receiveFlameSensor = async (req,res,next) => {
  const message = req.body.message.toString();
  const data = message.split(' ')[0];
  const id = message.split(' ')[1];
  const user = User.findById("663f41559216f2280ee26630");
  
  try {
    let notify = {
        to: user.FCMToken.toString(),
        notification: {
          title: "Notification",
          body: 'Flame Sensor Detected Something Wrong'
        },
    };
    function sendNotification(message){
      let clientServerOptions = {
        uri: 'https://fcm.googleapis.com/fcm/send',
        method: 'POST',
        body: JSON.stringify(message),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'key=AAAAEx2Gzqo:APA91bGNeVCLxP6iKFra3Ttit3X_OI53TM3Xr3mcdhThq0dM7O5AUkdy4d0vzFHnanrQeOh5vlsPA52w-8JObkQwhtDQw47NCNaYKXF8-DFf65H42MUaYjc5PehWcMWmVpMR0R70DkMK'
        }
      }
      request(clientServerOptions, function(error,res){
        console.log(error, res.body);
      });
    }
    sendNotification(notify);
    
    const sensorData = new SensorData({
        data: data,
        timestamp: Date.now(),
        sensorId: id
    });
    
    await sensorData.save();
    res.status(200).json({
      message: "received data from flame sensor"
    })
  }
  catch (err) {
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  }
  
}



exports.receiveGasSensor = async (req,res,next) => {
  const message = req.body.message.toString();
  const data = message.split(' ')[0];
  const id = message.split(' ')[1];
  const user = User.findById("663f41559216f2280ee26630");

  
  try {
    let notify = {
        to: user.FCMToken.toString(),
        notification: {
          title: "Notification",
          body: 'Gas Sensor Detected Something Wrong'
        },
    };
    function sendNotification(message){
      let clientServerOptions = {
        uri: 'https://fcm.googleapis.com/fcm/send',
        method: 'POST',
        body: JSON.stringify(message),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'key=AAAAEx2Gzqo:APA91bGNeVCLxP6iKFra3Ttit3X_OI53TM3Xr3mcdhThq0dM7O5AUkdy4d0vzFHnanrQeOh5vlsPA52w-8JObkQwhtDQw47NCNaYKXF8-DFf65H42MUaYjc5PehWcMWmVpMR0R70DkMK'
        }
      }
      request(clientServerOptions, function(error,res){
        console.log(error, res.body);
      });
    }
    sendNotification(notify);
    
    const sensorData = new SensorData({
        data: data,
        timestamp: Date.now(),
        sensorId: id
    });
    
    await sensorData.save();
    res.status(200).json({
      message: "received data from gas sensor"
    })
  }
  catch (err) {
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  }
  
}


exports.receiveCameraSensor = async (req,res,next) => {
  const message = req.body.message.toString();
  const data = message.split(' ')[0];
  const id = message.split(' ')[1];
  const user = User.findById("663f41559216f2280ee26630");

  
  try {
    let notify = {
        to: user.FCMToken.toString(),
        notification: {
          title: "Notification",
          body: 'Camera Detected Something Wrong'
        },
    };
    function sendNotification(message){
      let clientServerOptions = {
        uri: 'https://fcm.googleapis.com/fcm/send',
        method: 'POST',
        body: JSON.stringify(message),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'key=AAAAEx2Gzqo:APA91bGNeVCLxP6iKFra3Ttit3X_OI53TM3Xr3mcdhThq0dM7O5AUkdy4d0vzFHnanrQeOh5vlsPA52w-8JObkQwhtDQw47NCNaYKXF8-DFf65H42MUaYjc5PehWcMWmVpMR0R70DkMK'
        }
      }
      request(clientServerOptions, function(error,res){
        console.log(error, res.body);
      });
    }
    sendNotification(notify);
    
    const sensorData = new SensorData({
        data: data,
        timestamp: Date.now(),
        sensorId: id
    });
    
    await sensorData.save();
    res.status(200).json({
      message: "received data from camera"
    })
  }
  catch (err) {
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  }
  
}


exports.receivePirSensor = async (req,res,next) => {
  const message = req.body.message.toString();
  const data = message.split(' ')[0];
  const id = message.split(' ')[1];
  const user = User.findById("663f41559216f2280ee26630");

  
  try {
    let notify = {
        to: user.FCMToken.toString(),
        notification: {
          title: "Notification",
          body: 'Pir Sensor Detected Something Wrong'
        },
    };
    function sendNotification(message){
      let clientServerOptions = {
        uri: 'https://fcm.googleapis.com/fcm/send',
        method: 'POST',
        body: JSON.stringify(message),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'key=AAAAEx2Gzqo:APA91bGNeVCLxP6iKFra3Ttit3X_OI53TM3Xr3mcdhThq0dM7O5AUkdy4d0vzFHnanrQeOh5vlsPA52w-8JObkQwhtDQw47NCNaYKXF8-DFf65H42MUaYjc5PehWcMWmVpMR0R70DkMK'
        }
      }
      request(clientServerOptions, function(error,res){
        console.log(error, res.body);
      });
    }
    sendNotification(notify);
    
    const sensorData = new SensorData({
        data: data,
        timestamp: Date.now(),
        sensorId: id
    });
    
    await sensorData.save();
    res.status(200).json({
      message: "received data from pir sensor"
    })
  }
  catch (err) {
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  }
  
}


exports.receiveHealthSensor = async (req,res,next) => {
  const message = req.body.message.toString();
  const data = message.split(' ')[0];
  const id = message.split(' ')[1];
  const user = User.findById("663f41559216f2280ee26630");

  
  try {
    let notify = {
        to: user.FCMToken.toString(),
        notification: {
          title: "Notification",
          body: 'Health Sensor Detected Something Wrong'
        },
    };
    function sendNotification(message){
      let clientServerOptions = {
        uri: 'https://fcm.googleapis.com/fcm/send',
        method: 'POST',
        body: JSON.stringify(message),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'key=AAAAEx2Gzqo:APA91bGNeVCLxP6iKFra3Ttit3X_OI53TM3Xr3mcdhThq0dM7O5AUkdy4d0vzFHnanrQeOh5vlsPA52w-8JObkQwhtDQw47NCNaYKXF8-DFf65H42MUaYjc5PehWcMWmVpMR0R70DkMK'
        }
      }
      request(clientServerOptions, function(error,res){
        console.log(error, res.body);
      });
    }
    sendNotification(notify);
    
    const sensorData = new SensorData({
        data: data,
        timestamp: Date.now(),
        sensorId: id
    });
    
    await sensorData.save();
    res.status(200).json({
      message: "received data from health sensor"
    })
  }
  catch (err) {
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  }
  
}