var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//后端开启跨域
// app.all("*", (req, res, next) => { // 统一开启跨域支持
//   res.header("Access-Control-Allow-Origin", "*"); // 开启跨域支持 (重要)
//   res.header("Access-Control-Allow-Headers", "*"); // 前端可以使用任意的请求头
//   res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS"); // 前端可以使用的请求方法
//   res.header("Access-Control-Expose-Headers", 'Manager'); // 允许前端获取的响应头
//   next();
// });

app.use('/api', indexRouter);
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
