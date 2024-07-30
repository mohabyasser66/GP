const User = require('../models/user');
const UserSensors = require('../models/userSensors');
const SensorData = require('../models/sensorData');
const request = require('request');
const userSensors = require('../models/userSensors');



exports.getHomefriends = async (req, res, next) => {
  let hf = [];
  const user = await User.findById(req.body.userId);
    if(!user){
      const error = new Error('A user with this email could not be found');
      error.statusCode = 401;
      throw error;
    }
    try{
      await user.populate('homeFriends');
      for(let i in user.homeFriends){
        const { name, phone, email, long, late } = user.homeFriends[i];
        hf[i] = {name, email, phone, long, late};
      }
      res.status(200).json({
        message: 'Home Friends Fetched.',
        homeFriends : hf
      });
    }
    catch(err){
      if(!err.statusCode){
        err.statusCode = 500;
      }
      next(err);
    }
    
    // user.populate('homeFriends').then(ha => {
    //   for(let i in user.homeFriends){
    //     hf[i] = user.homeFriends[i].name;
    //   }
    //   res.status(200).json({
    //     message: 'Home Friends Fetched.',
    //     homeFriends : hf
    //   });
    // })
    // .catch( err => {
    //   const error = new Error(err);
    //   error.httpStatusCode = 500;
    //   return next(error);
    // });
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
      res.status(404).json("A user with this email could not be found");
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
      sensorId: req.body.sensorId,
      isMaster: req.body.isMaster,
      isDetected: req.body.isDetected,
      description: req.body.description,
      helperText: req.body.helperText
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

exports.getUserSensors = async (req,res,next) => {
  const sensors = await userSensors.find({ familyId: req.body.familyId });
  if(!sensors){
    const error = new Error('Could not find any sensor to this user.');
    error.statusCode = 401;
    throw error;
  }
  try{
    let s = [];
    for(let i in sensors){
      const { title, sensorId, isMaster, isDetected, description, helperText } = sensors[i];
      s[i] = { title, sensorId, isMaster, isDetected, description, helperText };
    }
    res.status(200).json({
      message: "sensors fetched.",
      sensors: s
    })
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
  try{
    const allData = await SensorData.find({sensorId : sensorId });
    const userOfSensor = await UserSensors.findOne({sensorId: sensorId});
  if(!allData){
    const error = new Error('A sensor with this ID could not be found');
    error.statusCode = 401;
    throw error;
  }
  res.status(200).json({
    data: allData,
    isMaster: userOfSensor.isMaster,
    isDetected: userOfSensor.isDetected
  });
  }
  catch(err){
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  }
  
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


exports.updateUser = async (req,res,next) => {
  const userId = req.body.userId;
  try{
    const user = await User.findByIdAndUpdate(userId, 
      {
        $set:{   
          name: req.body.name,
          email: req.body.email,
          phone: req.body.phone,
          late: req.body.late,
          long: req.body.long
        }
      },
      { new: true }
    );
    res.status(201).json({
      message: "User Updated Successfully."
    })

  }
  catch(err){
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  }

}


exports.updateSensor = async (req,res,next) => {
  const sensorId = req.body.sensorId;
  try{
    const sensor = await UserSensors.findOne({ sensorId: sensorId});
    if(!sensor){
      const error = new Error('A sensor with this ID could not be found');
      error.statusCode = 401;
      throw error;
    }
    sensor.isDetected = false;
    await sensor.save();
    res.status(200).json({
      message: "sensor status changed."
    });
  }
  catch(err){
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  }
}



exports.receiveFlameSensor = async (req,res,next) => {
  const message = req.body.message.toString();
  const data = message.split(' ')[0];
  const id = message.split(' ')[1];
  const user = await User.findById("663f41559216f2280ee26630");
  const usersensor = await UserSensors.findOne({sensorId: id});
  
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
        sensorId: id,
        description: "Flame Sensor detects any fire or heat",
        helperText: "Stay Calm, Cover Your Nose and Mouth, Avoid Elevators And Get To Safety."
      });
    usersensor.isDetected = true;
    await usersensor.save();
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
  const user = await User.findById("663f41559216f2280ee26630");
  const usersensor = await UserSensors.findOne({sensorId: id});
  
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
        sensorId: id,
        description: "Gas Sensor detects the presence of harmful gases in surrounding the area.",
        helperText: "Stay Calm, Cover Your Nose and Mouth, Avoid Confined Spaces, Move Quickly to Fresh Air And Seek Medical Attention."
    });
    usersensor.isDetected = true;
    await usersensor.save();
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
  const user = await User.findById("663f41559216f2280ee26630");
  const usersensor = await UserSensors.findOne({sensorId: id});
  
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
        sensorId: id,
        description: "The camera detects instances of individuals fainting or identifies the distress of helpless individuals.",
        helperText: "Rush To The Required Individual And Seek Medical Attention.",
    });
    usersensor.isDetected = true;
    await usersensor.save();
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
  const user = await User.findById("663f41559216f2280ee26630");
  const usersensor = await UserSensors.findOne({sensorId: id});
  
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
      sensorId: id,
      description: "PIR sensor detects unauthorized motion in certain areas like burglary.",
      helperText: "Stay Calm, Do Not Confront And Call Emergency.",
    });
    usersensor.isDetected = true;
    await usersensor.save();
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
  const type = req.body.type.toString();
  const value = Number(req.body.value);
  const id = "5";
  let body = "";
  let homefriendBody = "";
  let receipentTokens = [];
  const usersensor = await UserSensors.findOne({sensorId: id});
  const userId = usersensor.userId.toString();
  const user = await User.findById(userId);
  if(!user){
    const error = new Error('Could not find a user to this sensor.');
    error.statusCode = 401;
    throw error;
  }
  await user.populate('homeFriends');
  for(let i in user.homeFriends){
    const { FCMToken } = user.homeFriends[i];
    receipentTokens[i] = FCMToken;
  }
  if(type == "heart_rate"){
    body = "Your Heart rate is abnormal, seek an immediate assistance.";
    homefriendBody = "Your home friend " + user.name + " heart rate is abnormal, seek an immediate assistance.";
  }
  else if(type == "spo2"){
    body = "The oxygen in your blood is in abnormal state, seek an immediate assistance.";
    homefriendBody = "Your home friend " + user.name + " blood oxygen is abnormal, seek an immediate assistance.";
  }
  
  try {
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
    let mainNotify = {
      to: user.FCMToken.toString(),
      notification: {
        title: "Notification",
        body: body
      },
    };
    sendNotification(mainNotify);
    for(let j in receipentTokens){
      let friendNotify = {
        to: receipentTokens[j],
        notification: {
          title: "Notification",
          body: homefriendBody
        },
      };
      sendNotification(friendNotify);
    }
    
    const sensorData = new SensorData({
      data: value,
      timestamp: Date.now(),
      sensorId: id,
      description: "Health sensor monitor your vital data.",
      helperText: "Seek Medical Attention Immediately."
    });
    usersensor.isDetected = true;
    await usersensor.save();
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