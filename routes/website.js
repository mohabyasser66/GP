const express = require('express');
const { body } = require('express-validator');

const router = express.Router();
const websiteController = require('../controllers/website');
const isAuth = require('../middleware/is-auth');


router.get('/get-home-friends', websiteController.getHomefriends);

router.post('/add-home-friend', websiteController.postAddHomeFriend);

router.post('/delete-home-friend', websiteController.postDeleteHomeFriend);

router.post('/user-add-sensor', websiteController.postaddSensor);

router.post('/user-delete-sensor', websiteController.postdeleteSensor);

router.post('/get-sensor-data', websiteController.getSensorData);

router.post('/flame-sensor', websiteController.receiveFlameSensor);

router.post('/gas-sensor', websiteController.receiveGasSensor);

router.post('/camera-sensor', websiteController.receiveCameraSensor);

router.post('/pir-sensor', websiteController.receivePirSensor);

router.post('/health-sensor', websiteController.receiveHealthSensor);

module.exports = router;