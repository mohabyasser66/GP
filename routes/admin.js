const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const { body,check } = require("express-validator");

const router = express.Router();


router.get('/sensors', isAuth, adminController.getSensors);

router.get('/add-sensor', isAuth, adminController.getAddSensor);

router.post('/add-sensor', isAuth, 
[
    body('title').isString().withMessage("Enter Alphanumerics only").isLength({min:3}).trim(),
    body('description').isLength({min:5,max:200}).withMessage("Description must be bigger that 5 characters").trim()
] 
,adminController.postAddSensor);

router.get('/edit-sensor/:sensorId', isAuth, adminController.getEditSensor);

router.post('/edit-sensor',
[
    body('title').isString().withMessage("Enter Alphanumerics only").isLength({min:3}).trim(),
    body('description').isLength({min:5,max:200}).withMessage("Description must be bigger that 5 characters").trim()
] 
,isAuth, adminController.postEditSensor);


router.post('delete-sensor', isAuth, adminController.postDeleteSensor);

module.exports = router;
