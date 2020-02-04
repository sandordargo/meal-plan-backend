// import express from 'express';
// import db from './db/db'
// https://nordicapis.com/building-a-restful-api-using-node-js-and-mongodb/
var createError = require('http-errors');
var cors = require('cors');
var express = require('express');
const MongoClient = require("mongodb").MongoClient;

const bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var db = require('./db/db');
const DATABASE_NAME = "Recipes";
const collectionName = "recipes";

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
app.use(cors());
const port = 4000;

// var database, collection;
var collection;

var listener = app.listen(process.env.PORT || 5000, function(){
  console.log('Listening on port ' + listener.address().port); //Listening on port 5000
});

db.initialize(DATABASE_NAME, collectionName, function(dbCollection) { // successCallback
  // get all items
  dbCollection.find().toArray(function(err, result) {
    if (err) throw err;
    console.log(result);

  });
  collection = dbCollection;

  // << db CRUD routes >>

}, function(err) { // failureCallback
  throw (err);
});

app.get('/api/recipes', (req, res) => {
  var difficulty = req.query.difficulty;
  //support other query parameters
  var rawCategories = req.query.categories ? req.query.categories : "";
  var categories = rawCategories.split(',').filter(i => i);


  db.myData(difficulty, categories).then(function (items) {
    console.info('The promise was fulfilled with items!', items);
    res.status(200).send({
      success: 'true',
      message: 'recipes retreived successfully',
      recipes: items
    });
  }, function(err) {
    console.error('The promise was rejected', err, err.stack);
  });
});

app.get('/api/recipes/random', (req, res) => {
  var difficulty = req.query.difficulty;
  //support other query parameters
  var rawCategories = req.query.categories ? req.query.categories : "";
  var categories = rawCategories.split(',').filter(i => i);
  db.getRandomRecipe(difficulty, categories).then(function (items) {
    console.info('The promise was fulfilled with items!', items);
    res.status(200).send({
      success: 'true',
      message: 'recipes retreived successfully',
      recipes: items
    });
  }, function(err) {
    console.error('The promise was rejected', err, err.stack);
  });
});

// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/api/recipes', (req, res) => {
  console.log('POST body:', req.body);
  // db.add(req.body);
  collection.insert(req.body, (error, result) => {
    if (error) {
      return res.status(500).send(error);
    }
    res.send(result.result);
  });
  // res.sendStatus(200);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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

// app.listen(5000, () => {
//   MongoClient.connect("mongodb+srv://rest-api-user:MyRecipes2020@recipes-iblou.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true }, (error, client) => {
//     if(error) {
//       throw error;
//     }
//     database = client.db(DATABASE_NAME);
//     collection = database.collection(collectionName);
//     console.log("Connected to `" + DATABASE_NAME + "`!");
//   });
// });


module.exports = app;
