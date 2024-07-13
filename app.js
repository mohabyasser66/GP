const path = require('path');
const http = require("http");

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


const SensorData = require("./models/sensorData");

const app = express();

const authRoutes = require('./routes/auth');
const websiteRoutes = require('./routes/website');
const adminRoutes = require('./routes/admin');



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use( (req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});


app.use(authRoutes);
app.use(websiteRoutes);
app.use(adminRoutes);


app.use( (err,req,res,next) => {
    console.log(err);
    const status = err.statusCode || 500;
    const message = err.message;
    const data = err.data;
    res.status(status).json({message:message, data:data});
});


mongoose.connect('mongodb+srv://nodejs:862475139@cluster0.ib29zfy.mongodb.net/SDS?retryWrites=true&w=majority')
.then(result => {
    console.log('Connected to MongoDB database!');
    app.listen(3000);
})
.catch( err => {
    console.log(err);
});

//mongodb+srv://nodejs:862475139@cluster0.ib29zfy.mongodb.net/SDS?retryWrites=true&w=majority

function keepServerAlive(){
    http.get('http://localhost:3000/keepAlive', (res) => console.log("I am alive"));
}

setInterval(keepServerAlive, 300000);