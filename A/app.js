var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const flash = require('connect-flash')
const flash1 = require('express-flash')
const session = require('express-session')
const passport = require('passport')
const mailHelper = require('./helper/mailHelper')
const fileUpload = require('express-fileupload');

//Routers
var ptRouter = require('./routes/pt');
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var homeRouter = require('./routes/home')

var app = express();

// //Flash middlewares
app.use(fileUpload());
app.use(cookieParser("SECRET"))
app.use(session({
  cookie : {maxAge : 600000},
  resave : true,
  secret : "SECRET",
  saveUninitialized : true
}))


app.use(flash())
app.use(flash1())

//Yönlerdirme mesajlarını localde tutmak için
app.use((req,res,next) => {

  res.locals.flashSuccess = req.flash("flashSuccess")
  res.locals.flashError = req.flash("flashError")
  next()

})


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', homeRouter);
app.use('/user', userRouter);
app.use('/pt', ptRouter);
app.use('/admin', adminRouter);

app.use(function(req, res, next) {
  next(createError(404));
});


app.use(function(err, req, res, next) {

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');

});


module.exports = app;
