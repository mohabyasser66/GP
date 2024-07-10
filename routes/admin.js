const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const restrictTo = require('../middleware/restrict-to');
const { body } = require("express-validator");

const router = express.Router();


router.get('/sensors', isAuth, restrictTo('admin'), adminController.getSensors);

router.post('/create-sensor', isAuth, restrictTo('admin'),
[
    body('title').isString().withMessage("Enter Alphanumerics only").isLength({min:3}).trim(),
    body('description').isLength({min:5,max:200}).withMessage("Description must be bigger that 5 characters").trim()
] 
,adminController.createSensor);

router.get('/edit-sensor/:sensorId', isAuth, restrictTo('admin'), adminController.getEditSensor);

router.post('/edit-sensor', isAuth, restrictTo('admin'),
[
    body('title').isString().withMessage("Enter Alphanumerics only").isLength({min:3}).trim(),
    body('description').isLength({min:5,max:200}).withMessage("Description must be bigger that 5 characters").trim()
] 
, adminController.postEditSensor);


router.post('/delete-sensor/:sensorId', isAuth, restrictTo('admin'), adminController.postDeleteSensor);

module.exports = router;
