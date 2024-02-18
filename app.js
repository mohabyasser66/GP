const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const mongoDBStore = require('connect-mongodb-session')(session);

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();
const store = new mongoDBStore({
  uri: 'mongodb://localhost:27017/userDatabase',
  collection: 'sessions'
});


app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret:'my secret', resave: false, saveUninitialized: false, store: store
}));

const authRoutes = require('./routes/auth');
const websiteRoutes = require('./routes/website');
const adminRoutes = require('./routes/admin');



app.use((req,res,next) => {
  if (!req.session.user){
    return next();
  }
  User.findById(req.session.user._id)
  .then(user => {
    if(!user){
      return next();
    }
    req.user = user;
    next();
  })
  .catch( err => {
    next(new Error(err));
  });
});

app.use( (req,res,next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  // res.locals.csrfToken = req.csrfToken();
  next();
});


app.use(authRoutes);
app.use(websiteRoutes);
app.use(adminRoutes);




app.get('/500', errorController.get500);
app.use(errorController.get404);
app.use( (error,req,res,next) =>{
  console.log(error);
  res.redirect('/500');
});


mongoose.connect('mongodb://localhost:27017/userDatabase')
.then(result => {
  console.log('Connected to MongoDB database!');
  app.listen(3000);
})
.catch(err => {
  console.log('Error connecting to MongoDB:', err);
});