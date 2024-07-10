const Sensor = require('../models/showSensors');
const User = require('../models/user');
const {validationResult} = require('express-validator');


exports.getSensors = async(req,res,next) => {
    const sensors = await Sensor.find();
    if(!sensors){
        const error = new Error('no sensors found');
        error.statusCode = 404;
        throw error;
    }
    try{
        res.status(200).json({
            sensors:sensors,
            message:'sensors fetched successfully'
        });
    }  
    catch(err) {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    };
}


exports.createSensor = async (req,res,next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('validation failed, the data entered is incorrect.');
        error.statusCode = 422;
        throw error;
    };

    const sensor = new Sensor({
        title: title,
        description: description,
        imageUrl: imageUrl,
        adminId: req.userId
    });
    try{
        await sensor.save();
        console.log('Created Sensor');
        res.status(201).json({
            message:'Sensor created successfully.',
            sensor: sensor
        });
    }
    catch(err) {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.getEditSensor = async (req,res,next) => {
    const sensorId = req.params.sensorId;
    const sensor = await Sensor.findById(sensorId);
    if(!sensor) {
        const error = new Error('sensor could not be found.');
        error.statusCode = 404;
        throw error;
    }
    try{
        res.status(200).json({
            message:'Sensor Fetched',
            sensor: sensor
        });
    }
    catch(err) {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    };
}

exports.postEditSensor = async (req,res,next) => {
    const sensorId = req.body.sensorId;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDesc = req.body.description;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    try{
        const sensor = await Sensor.findById(sensorId);
        sensor.title = updatedTitle;
        sensor.imageUrl = updatedImageUrl;
        sensor.description = updatedDesc;
        const result = await sensor.save()
        res.status(200).json({
            message:'Sensor Updated',
            sensor: result
        });
    }
    catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    };
}


exports.postDeleteSensor = async (req,res,next) => {
    const sensorId = req.params.sensorId;
    try {
      const sensor = await Sensor.findById(sensorId);
      if (!sensor) {
        const error = new Error('Could not find sensor.');
        error.statusCode = 404;
        throw error;
      }
      await Sensor.findByIdAndDelete(sensorId);
      res.status(200).json({ message: 'Deleted post.' });
    } 
    catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
}