const express = require('express');
const { body } = require('express-validator');

const router = express.Router();
const websiteController = require('../controllers/website');
const restrict = require('../middleware/restrict-to');


router.post('/get-home-friends', websiteController.getHomefriends);

router.get('/get-all-users',websiteController.getAllUsers);

router.post('/add-home-friend', websiteController.postAddHomeFriend);

router.post('/delete-home-friend', websiteController.postDeleteHomeFriend);

router.post('/user-add-sensor', websiteController.postaddSensor);

router.post('/user-delete-sensor', websiteController.postdeleteSensor);

router.post('/update-user', websiteController.updateUser);

router.post('/update-sensor', websiteController.updateSensor);

router.post('/get-user-sensors', websiteController.getUserSensors);

router.post('/get-sensor-data', websiteController.getSensorData);

router.post('/flame-sensor', websiteController.receiveFlameSensor);

router.post('/gas-sensor', websiteController.receiveGasSensor);

router.post('/camera-sensor', websiteController.receiveCameraSensor);

router.post('/pir-sensor', websiteController.receivePirSensor);

router.post('/health-sensor', websiteController.receiveHealthSensor);

router.post('/environment-sensor', websiteController.receiveEnvironmentDanger);

module.exports = router;