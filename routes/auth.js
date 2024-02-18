const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

const authController = require('../controllers/auth');
const User = require('../models/user');



router.post('/login', [
    body('email').isEmail().withMessage('please enter a valid email address').normalizeEmail(),
    body('password','Password has to be valid').isLength({min:5}).isAlphanumeric().trim()
] ,authController.postlogin);


router.post('/signup',[
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
    body('confirmPassword').trim().custom( (value, {req}) => {
        if(value!==req.body.password) {
            throw new Error('passwords have to match');
        }
        return true;
    })
], authController.postSignup);

router.post('/logout',authController.postLogout);

module.exports = router;