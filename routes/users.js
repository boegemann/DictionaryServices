var express = require('express'),
  config = require('../config'),
  jwt = require('jsonwebtoken'),
  userService = require('../dao/users'),
  security = require('../security/jwt');


const SET_APP_STATE = 'SET_APP_STATE';
const setAppState = function (newState) {
  return {
    type: SET_APP_STATE,
    newState: newState
  }
};

var getNewState = require("../uimanagement/ApplicationState").getNewState;

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






app.post('/sessions/create', function (req, res) {

  var userScheme = getUserScheme(req);

  if (!userScheme.username || !req.body.password) {
    return res.status(400).send("You must send the username and the password");
  }

  userService.findLogin(userScheme.username, req.body.password, function (err, user) {
    if (!user) {
      res.status(401).send("The username or password don't match");
      return;
    }
    console.log(user);
    getNewState(security.createAccessToken(user), "/home", function (state) {
      res.status(201).send([setAppState(state)]);
    });
  });


});
