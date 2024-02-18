const Sensor = require('../models/sensor');
const {validationResult} = require('express-validator');


exports.getSensors = (req,res,next) => {
    Sensor.find()
    .then(sensors => {
        if(!sensors) return next( new Error('no sensors found'));
        res.render('admin/sensors',{
            sensors:sensors
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.getAddSensor = (req,res,next) => {
    res.render('admin/add-sensor', {
        pageTitle: 'Add Sensor',
        path: '/admin/add-Sensor',
        hasError: false,
        errorMessage:null,
        validationErrors: []
    });
}

exports.postAddSensor = (req,res,next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/add-sensor', {
          pageTitle: 'Add Sensor',
          path: '/admin/add-sensor',
          editing: false,
          hasError: true,
          product: {
            title:title,
            description: description,
          },
          errorMessage:errors.array()[0].msg,
          validationErrors: errors.array()
        });
    }

    const sensor = new Sensor({
        title: title,
        description: description,
        imageUrl: imageUrl,
        userId: req.user
    });
    sensor.save().then(result => {
      console.log('Created Sensor');
      res.redirect('/sensors');
    })
    .catch( err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}

exports.getEditSensor = (req,res,next) => {
    const sensorId = req.params.sensorId;
    Sensor.findById(sensorId).then(sensor => {
        if(!sensor) {
            return res.redirect('/');
        }
        res.render('admin/edit-sensor',{
            hasError: false,
            sensor: sensor,
            errorMessage: null
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
    
}

exports.postEditSensor = (req,res,next) => {
    const sensorId = req.body.sensorId;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDesc = req.body.description;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-sensor', {
          pageTitle: 'Edit Sensor',
          path: '/admin/edit-sensor',
          hasError: true,
          product: {
            title:updatedTitle,
            description: updatedDesc,
            imageUrl: updatedImageUrl,
            _id: prodId
          },
          errorMessage:errors.array()[0].msg,
          validationErrors: errors.array(),
        });
    }

    Sensor.findById(sensorId)
    .then(sensor => {
      if(sensor.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      sensor.title = updatedTitle;
      sensor.imageUrl = updatedImageUrl;
      sensor.description = updatedDesc;
      return sensor.save().then(result => {
        console.log('Updated Sensor');
        res.redirect('/sensors');
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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
    if (sensor.adminId.toString() !== req.userId) {
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }
    await Sensor.findByIdAndDelete(sensorId);
    const user = await User.findById(req.userId);
    user.posts.pull(sensorId);
    await user.save();
    console.log('Sensor Deleted');
    res.redirect('/sensors');
  } 
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}