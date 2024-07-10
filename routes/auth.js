const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

const authController = require('../controllers/auth');
const User = require('../models/user');
const isAuth = require('../middleware/is-auth');



router.post('/login', [
    body('email').isEmail().withMessage('please enter a valid email address'),
    body('password','Password has to be valid').isLength({min:5}).isAlphanumeric()
] ,authController.login);


router.put('/signup',[
    body('email').isEmail().withMessage('please enter a valid email.').custom( (value, {req}) => {
        return User.findOne({email: value}).then(userDoc => {
            if(userDoc) {
              return Promise.reject('Email exists already, please pick a different one');
            }
        })
    }).normalizeEmail(),
    body('password','please enter an alphanumeric password with at least 5 characters')
    .isLength({min:5})
    .isAlphanumeric().trim(),
    body('name')
      .trim()
      .not()
      .isEmpty()
], authController.signup);

// router.post('/logout',authController.logout);

// router.post('/fcm-token', isAuth, authController.FCMToken);

module.exports = router;