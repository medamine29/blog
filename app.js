var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const passport = require('passport');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
var indexRouter = require('./routes/index.route');
var usersRouter = require('./routes/users.route');
const User = require('./models/user.model');
const Article = require('./models/article.model');
const categoryModel = require('./models/category.model');
const dotenv = require('dotenv').config();

var app = express();

app.use(session({
  secret: 'bddffzfe85241fdfezfez',
  resave: false,
  saveUninitialized: false
}));

mongoose.connect('mongodb://localhost:27017/blog',{useNewUrlParser: true, useUnifiedTopology: true})
  .then(()=>console.log("Connexion à MongoDB réussie"))
  .catch(()=> console.log("Echec de connexion à mongoDB"));

if(!(categoryModel.find()).length){
  const data = ["Actualités", "Sport", "Littérature", "Divers"]
  data.forEach(async (e)=>{
    const newCategory = new categoryModel({title: e, description: "Article de la catégorie : "+e})
    await newCategory.save()
    console.log(newCategory);
  })
}
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Init flash
app.use(flash());

//Init Passport
app.use(passport.initialize());
app.use(passport.session());

//passport local mongoose
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
  if(req.isAuthenticated()){
    Article.find({author: req.user._id}, (err, articles)=>{
      if(err){
        console.log(err);
      }else{
        res.locals.articles = articles;
      }
      next()

    })
  }else{
    next();
  }
})

app.use((req, res, next)=>{
  res.locals.user = req.user;
  res.locals.error = req.flash('error');
  res.locals.warning = req.flash('warning');
  res.locals.success = req.flash('success');
  res.locals.errorForm = req.flash('errorForm');
  next();
})


app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
