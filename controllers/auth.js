const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = async (req,res,next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    const phone = req.body.phone;
    try{
        const hashedPw = await bcrypt.hash(password,12);
        
        const user = new User({
            email:email,
            password: hashedPw,
            name:name,
            phone: phone
        });
        const result = await user.save();
        res.status(201).json({message:'User created.', userId: result._id});
    }
    catch(err) {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    };
}


exports.login = async (req,res,next) => {
    const email = req.body.email;
    const password = req.body.password;
    const token = req.body.token;
    let loadedUser;
    try{
        const user = await User.findOne({email:email});
        
        if(!user){
            const error = new Error('A user with this email could not be found');
            error.statusCode = 401;
            throw error;
        }
        loadedUser = user;
        const isEqual = await bcrypt.compare(password, user.password);
        if(!isEqual){
            const error = new Error('Wrong Password');
            error.statusCode = 401;
            throw error;
        }
        user.FCMToken = token;
        await user.save();
        // const token = jwt.sign({
        //     email:loadedUser.email,
        //     userId: loadedUser._id.toString()
        // },
        // 'somesupersecretsecret',
        // {expiresIn: '2h'}
        // );
        res.status(200).json({ userId: loadedUser._id.toString(), name: loadedUser.name, role: loadedUser.role, late: loadedUser.late, long: loadedUser.long});
    
    }
    catch(err) {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    };
}


exports.logout = (req,res,next) => {
    console.log('logged out');
    res.json({
        message:'logged out'
    })
}



exports.FCMToken = async (req,res,next) => {
    const token = req.body.token;
    const user = await User.findById(req.userId);
    if(!user){
        const error = new Error('A user with this email could not be found');
        error.statusCode = 401;
        throw error;
    }
    try{
        user.FCMToken = token.toString();
        await user.save();
    }
    catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
    
}