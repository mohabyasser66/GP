const User = require('../models/user');
const UserSensors = require('../models/userSensors');
const SensorData = require('../models/sensorData');
const userSensors = require('../models/userSensors');
const axios = require('axios');
const { google } = require('googleapis');
const mqtt = require('mqtt');
require("dotenv").config();
// const serviceAccount = require('../group-of-rest-end-point-firebase-adminsdk-4gqsv-a086f6a0b2.json');

const SCOPES = ['https://www.googleapis.com/auth/firebase.messaging'];

const auth = new google.auth.JWT({
  email: process.env.client_email,
  key: process.env.private_key,
  scopes: SCOPES
});

async function getAccessToken() {
  const tokens = await auth.authorize();
  return tokens.access_token;
}


async function sendFcmNotification(token, notification) {
  const accessToken = await getAccessToken();
  const fcmUrl = `https://fcm.googleapis.com/v1/projects/${process.env.project_id}/messages:send`;

  const payload = {
    message: {
      token: token,  // Device FCM token
      notification: {
        title: notification.title,
        body: notification.body,
      },
    },
  };
  try {
    const response = await axios.post(fcmUrl, payload, {
      headers: {
        'Authorization': "Bearer " + accessToken,
        'Content-Type': 'application/json',
      },
    });
    console.log('Notification sent successfully:', response.data, new Date(Date.now()).toLocaleTimeString() );
    
  }
  catch (err) {
    console.log('Error sending notification:', err.response ? err.response.data : err.message);
  }
}


async function saveData(description, helperText, data, id, usersensor){
  const sensorData = new SensorData({
    data: data,
    timestamp: Date.now(),
    sensorId: id,
    description: description,
    helperText: helperText,
  });
  usersensor.isDetected = true;
  await usersensor.save();
  await sensorData.save();
}

const client = mqtt.connect("mqtt://localhost");
client.on('connect', () => {
  console.log('Connected to MQTT broker');
});

client.on('error', (error) => {
  console.error('Error:', error);
});


exports.getHomefriends = async (req, res, next) => {
  let hf = [];
  const user = await User.findById(req.body.userId);
    try{
      if(!user){
        const error = new Error('A user with this email could not be found');
        error.statusCode = 401;
        throw error;
      }
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

exports.getAllUsers = async (req,res,next) => {
  const users = await User.find();
  let allUsers = [];
  let oneUser = {};
  try{
    if(!users) {
      const error = new Error("could not find any user.");
      error.statusCode = 404;
      throw error;
    }
    users.forEach((user) => {
      oneUser = {
        "id": user._id,
        "name": user.name,
        "email": user.email,
        "homeFriends": user.homeFriends,
        "phone": user.phone,
        "familyId": user.familyId,
        "Late": user.late,
        "long": user.long,
        "sensors": user.sensors
      }
      allUsers.push(oneUser);
    });
    res.status(200).json({
      message: "Users Fetched Successfully.",
      Users: allUsers
    })

  }
  catch(err){
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.postAddHomeFriend = async (req,res,next) => {
  const friendId = req.body.friendId;
  const user = await User.findById(req.body.userId);
  try{
    if(!user){
      const error = new Error('A user with this email could not be found');
      error.statusCode = 404;
      throw error;
    }
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
  try{
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
  catch(err){
    res.status(404).json("A user with this email could not be found");
      if(!err.statusCode){
        err.statusCode = 500;
      }
    next(err);
  }
}

exports.postaddSensor = async (req,res,next) => {
  const user = await User.findById(req.body.userId);
  try{
    if(!user){
      const error = new Error('A user with this email could not be found');
      error.statusCode = 401;
      throw error;
    }
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
  try{
    if(!sensors){
      const error = new Error('Could not find any sensor to this user.');
      error.statusCode = 401;
      throw error;
    }
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
  try{
    if(!user){
      const error = new Error('A user with this email could not be found');
      error.statusCode = 401;
      throw error;
    }
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
    const allData = await SensorData.find({sensorId : sensorId }).select("sensorId timestamp data description helperText -_id");
    const userOfSensor = await UserSensors.findOne({sensorId: sensorId});
  if(!allData){
    const error = new Error('A sensor with this ID could not be found');
    error.statusCode = 401;
    throw error;
  }
  if(!userOfSensor){
    const error = new Error('Could not find user to this sensor');
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
  const description = "Flame Sensor detects any fire or heat";
  const helperText = "Stay Calm, Cover Your Nose and Mouth, Avoid Elevators And Get To Safety.";
  
  const deviceToken = user.FCMToken.toString();  // The FCM token for the specific device
  const notification = {
    title: 'Notification',
    body: 'Flame Sensor Detected Something Wrong',
  };

  sendFcmNotification(deviceToken, notification);
  saveData(description, helperText, data, id, usersensor);
  res.status(200).json({
    message: "received data from Flame sensor"
  });
}



exports.receiveGasSensor = async (req,res,next) => {
  const message = req.body.message.toString();
  const data = message.split(' ')[0];
  const id = message.split(' ')[1];
  const user = await User.findById("663f41559216f2280ee26630");
  const usersensor = await UserSensors.findOne({sensorId: id});
  const description = "Gas Sensor detects the presence of harmful gases in surrounding the area.";
  const helperText = "Stay Calm, Cover Your Nose and Mouth, Avoid Confined Spaces, Move Quickly to Fresh Air And Seek Medical Attention.";
  
  const deviceToken = user.FCMToken.toString();
  const notification = {
    title: 'Notification',
    body: 'Gas Sensor Detected Something Wrong',
  };

  sendFcmNotification(deviceToken, notification);
  saveData(description, helperText, data, id, usersensor);
  res.status(200).json({
    message: "received data from gas sensor"
  });
}


exports.receiveCameraSensor = async (req,res,next) => {
  const message = req.body.message.toString();
  const data = message.split(' ')[0];
  const id = message.split(' ')[1];
  const user = await User.findById("663f41559216f2280ee26630");
  const usersensor = await UserSensors.findOne({sensorId: id});
  const description = "The camera detects instances of individuals fainting or identifies the distress of helpless individuals.";
  const helperText = "Rush To The Required Individual And Seek Medical Attention.";
  
  const deviceToken = user.FCMToken.toString();
  const notification = {
    title: 'Notification',
    body: 'Camera Detected Something Wrong',
  };
  sendFcmNotification(deviceToken, notification);
  saveData(description, helperText, data, id, usersensor);
  client.publish("buzzer/control", "Activate Buzzer", (err) => {
    if (err) {
      console.error('Failed to publish MQTT message:', err);
    }
    console.log(`Published buzz notification.`);
  });
  res.status(200).json({
    message: "received data from camera"
  });
}


exports.receivePirSensor = async (req,res,next) => {
  const message = req.body.message.toString();
  const data = message.split(' ')[0];
  const id = message.split(' ')[1];
  const user = await User.findById("663f41559216f2280ee26630");
  const usersensor = await UserSensors.findOne({sensorId: id});
  const description = "PIR sensor detects unauthorized motion in certain areas like burglary.";
  const helperText = "Stay Calm, Do Not Confront And Call Emergency.";
 
  const deviceToken = user.FCMToken.toString();
  const notification = {
    title: 'Notification',
    body: 'PIR sensor Detected Something Wrong',
  };
  sendFcmNotification(deviceToken, notification);
  saveData(description, helperText, data, id, usersensor);
  res.status(200).json({
    message: "received data from pir sensor"
  });
}


exports.receiveHealthSensor = async (req,res,next) => {
  const type = req.body.type.toString();
  const value = Number(req.body.value);
  const id = "5";
  let receipentTokens = [];
  const usersensor = await UserSensors.findOne({sensorId: id});
  const userId = usersensor.userId.toString();
  const user = await User.findById(userId);
  const description = "Health sensor monitor your vital data.";
  const helperText = "Seek Medical Attention Immediately.";
  let notification = {
    title: 'Notification',
    body: ''
  };
  let friendNotification = {
    title: 'Notification',
    body: ''
  }
  try {
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
      notification.body = "Your Heart rate is abnormal, seek an immediate assistance.";
      friendNotification.body = "Your home friend " + user.name + " heart rate is abnormal, seek an immediate assistance.";
    }
    else if(type == "spo2"){
      notification.body = "The oxygen in your blood is in abnormal state, seek an immediate assistance.";
      friendNotification.body = "Your home friend " + user.name + " blood oxygen is abnormal, seek an immediate assistance.";
    }
   
    sendFcmNotification(user.FCMToken.toString(), notification);
    for(let j in receipentTokens){
      sendFcmNotification(receipentTokens[j], friendNotification);
    }
    saveData(description, helperText, value, id, usersensor);
    client.publish("buzzer/control", "Activate Buzzer", (err) => {
      if (err) {
        console.error('Failed to publish MQTT message:', err);
      }
      console.log(`Published buzz notification.`);
    });

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




exports.receiveEnvironmentDanger = async (req,res,next) => {
  const temperature = Number(req.body.temperature); 
  const tokens = await User.find().select("FCMToken -_id");
  // const description = "Environment Danger keep you safe from outside threats.";
  // const helperText = "stay safe inside your house.";
  // console.log(tokens);
  const notification = {
    title: 'Notification',
    body: 'Warning: There is a 60% chance of fires in agricultural areas of Hurghada due to increased dust. The risk is higher in arid regions. Please take necessary precautions.',
  };
  
  try {
    if(!tokens){
      const error = new Error('Could not find required tokens.');
      error.statusCode = 401;
      throw error;
    }
    
    for(let i in tokens){
      sendFcmNotification(tokens[i].FCMToken, notification);
    }
    
    res.status(200).json({
      message: "received data from Environment sensor"
    })
  }
  catch (err) {
    if(!err.statusCode){
      err.statusCode = 500;
    }
    next(err);
  }
  
}