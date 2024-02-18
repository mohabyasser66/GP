const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');


const User = require('../models/user');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'Sddteamsalah@gmail.com',
      pass: 'Sddteamsalah1'
    },
});


exports.postlogin = (req,res,next) => {

    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).render('index',{
        errorMessage: errors.array()[0].msg,
        oldInput: {email: email, password: password},
        validationErrors: errors.array()
        })
    }

    User.findOne({ email: email })
    .then(user => {
        if(!user) {
        return res.status(422).render('index',{
            errorMessage: 'invalid email or password',
            oldInput: {email:email , password:password},
            validationErrors: []
        });
        }
        bcrypt.compare(password, user.password)
        .then(doMatch => {
        if(doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
                console.log(err);
                res.redirect('/home');
            });
        }
        return res.status(422).render('index',{
            errorMessage: 'invalid email or password',
            oldInput: {email:email , password:password},
            validationErrors: []
        });
        })
        .catch(err => {
        console.log(err);
        });
    })
    .catch( err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}




exports.postSignup = (req,res,next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('index', {
          errorMessage: errors.array()[0].msg,
          oldInput: {email: email, password: password, confirmPassword: req.body.confirmPassword},
          validationErrors: errors.array()
        });
    }
    bcrypt.hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
      });
      return user.save();
    })
    .then(result => {
        res.redirect('/thankyou');
        return transporter.sendMail({
            to: email,
            subject: 'Signup Succedded',
            html: '<h1>You successfully signed up</h1>'
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
      console.log(err);
      res.redirect('/');
    })
};