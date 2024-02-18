
const User = require('../models/user');
const Sensor = require('../models/sensor');


exports.getIndex = (req, res, next) => {
    res.render('website/index',{
        name: "yousses",
        errorMessage: null,
        oldInput: {email: "", password: ""}, 
        validationErrors: []
    });
}


exports.getHome = (req, res, next) => {
    req.user.populate(['sensors.sensorId','homeFriends'])
    .then(user => {
        const homeFriends = user.homeFriends;
        const sensors = user.sensors;
        res.render('website/home',{
            homeFriends : homeFriends,
            sensors: sensors
        });
    })
    .catch( err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}


exports.getThankyou = (req, res, next) => {
    res.render('website/thankyou');
}

// exports.getPricing = (req, res, next) => {
//     res.render('pricing');
// }


exports.getContact = (req, res, next) => {
    res.render('website/contact');
}

exports.getAbout = (req, res, next) => {
    res.render('website/about');
}


exports.getHomefriends = (req, res, next) => {
    req.user
      .populate('homeFriends._id')
      .then(user => {
        const homeFriends = user.homeFriends.name;
      })
      .catch( err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
};


exports.postAddHomeFriend = (req,res,next) => {
    const friendId = req.body.friendId;
    req.user.addHomeFriend(friendId);
    res.redirect('/home');
}

exports.postDeleteHomeFriend = (req,res,next) => {
    const friendId = req.body.friendId;
    req.user.removeHomeFriend(friendId);
    res.redirect('/home');
}

exports.postUserAddSensor = (req,res,next) => {
    const sensorId = req.body.sensorId;
    req.user.addSensor(sensorId);
    res.redirect('/home');
}


exports.postUserDeleteSensor = (req,res,next) => {
    const sensorId = req.body.sensorId;
    req.user.removeSensor(sensorId);
    res.redirect('/home');
}