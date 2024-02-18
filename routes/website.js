const express = require('express');
const { body } = require('express-validator');

const router = express.Router();
const websiteController = require('../controllers/website');
const isAuth = require('../middleware/is-auth');


router.get('/', websiteController.getIndex);

router.get('/home', isAuth,websiteController.getHome);

router.get('/thankyou', websiteController.getThankyou);

// router.get('/pricing', websiteController.getPricing);

router.get('/contact', isAuth,websiteController.getContact);

router.get('/about', isAuth,websiteController.getAbout);

router.post('/addhomefriend', isAuth, websiteController.postAddHomeFriend);

router.post('/deletehomefriend', isAuth, websiteController.postDeleteHomeFriend);

router.post('/user-add-sensor', isAuth, websiteController.postUserAddSensor);

router.post('/user-delete-sensor', isAuth, websiteController.postUserDeleteSensor);


module.exports = router;