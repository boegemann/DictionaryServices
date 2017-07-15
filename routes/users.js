var express = require('express'),
  _ = require('lodash'),
  config = require('../config'),
  jwt = require('jsonwebtoken'),
  userService = require('../services/users');


const SET_APP_STATE = 'SET_APP_STATE';
const setAppState = function (newState)  {
  return {
    type: SET_APP_STATE,
    newState: newState
  }
}

var getNewState = require("../application/ApplicationState").getNewState

var app = module.exports = express.Router();


function getUserScheme(req) {

  var username;
  var type;

  // The POST contains a username and not an email
  if (req.body.username) {
    username = req.body.username;
    type = 'username';
  }
  // The POST contains an email and not an username
  else if (req.body.email) {
    username = req.body.email;
    type = 'email';
  }

  return {
    username: username,
    type: type
  }
}


var users = [{
  username: 'gonto',
  password: 'gonto'
}];


function createAccessToken(user) {
  return jwt.sign({
    iss: config.issuer,
    aud: config.audience,
    exp: Math.floor(Date.now() / 1000) + (60),
    scope: 'full_access',
    sub: user,
    jti: genJti(), // unique identifier for the token
    alg: 'HS256'
  }, config.secret);
}

// Generate Unique Identifier for the access token
function genJti() {
  var jti = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < 16; i++) {
    jti += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return jti;
}


app.post('/sessions/create', function (req, res) {

  var userScheme = getUserScheme(req);

  if (!userScheme.username || !req.body.password) {
    return res.status(400).send("You must send the username and the password");
  }

  var user = userService.findLogin(userScheme.username, req.body.password, function (err, user) {
    if (!user) {
      res.status(401).send("The username or password don't match");
      return;
    }
    console.log(user);
    getNewState(createAccessToken(user), function (state) {
      res.status(201).send([setAppState(state)]);
    });
  });


});
