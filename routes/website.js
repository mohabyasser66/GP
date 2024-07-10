const express = require('express');
const { body } = require('express-validator');

const router = express.Router();
const websiteController = require('../controllers/website');
const isAuth = require('../middleware/is-auth');


router.get('/get-home-friends', isAuth, websiteController.getHomefriends);

router.post('/add-home-friend', isAuth, websiteController.postAddHomeFriend);

router.post('/delete-home-friend', isAuth, websiteController.postDeleteHomeFriend);

router.post('/user-add-sensor', isAuth, websiteController.postaddSensor);

router.post('/user-delete-sensor', isAuth, websiteController.postdeleteSensor);

router.post('/get-sensor-data', isAuth, websiteController.getSensorData);

router.post('/flame-sensor', websiteController.receiveFlameSensor);

router.post('/gas-sensor', websiteController.receiveGasSensor);

router.post('/camera-sensor', websiteController.receiveCameraSensor);

router.post('/pir-sensor', websiteController.receivePirSensor);

router.post('/health-sensor', websiteController.receiveHealthSensor);

module.exports = router;