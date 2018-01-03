
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var index = require('./routes/index');
var sessionend = require('./routes/sessionend');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
// https://expressjs.com/zh-cn/starter/static-files.html
app.use(favicon(path.join(__dirname, 'public/images', 'favicon.png')));
app.use(logger('dev')); //日志中间件
app.use(bodyParser.json()); //解析json的中间件
app.use(bodyParser.urlencoded({ extended: false }));  //解析urlencoded请求体的中间件
app.use(cookieParser());  //解析cookie的中间件
app.use('/static', express.static(__dirname + '/public'));
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static('files'));

app.use('/learner', index);
app.use('/sessionend', sessionend);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
