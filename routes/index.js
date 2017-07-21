var express = require('express');
var router = express.Router();
var security = require("../security/jwt");
var getNewState = require("../uimanagement/ApplicationState").getNewState;

var userService = require('../dao/users');

var getScreenData = require("../uimanagement/Screens").getScreenData;

var getActionsForNavDescriptor = require("../uimanagement/ApplicationState").getActionsForNavDescriptor;
var getNavigationDescriptor = require("../uimanagement/ApplicationState").getNavigationDescriptor;


const SCREEN_DATA_SUCCESS = 'SCREEN_DATA_SUCCESS';
const SCREEN_DATA_FAILURE = 'SCREEN_DATA_FAILURE';
const receiveScreenData = function (screenData) {
  return {
    type: SCREEN_DATA_SUCCESS,
    screenData: screenData
  }
};

const screenDataError = function (error) {
  return {
    type: SCREEN_DATA_FAILURE,
    error: error
  }
};

const createNavigationActions = function (params, next) {
  getNavigationDescriptor(
    params.oldPath,
    params.newPath,
    params.access_token
    , function (descriptor) {
      next(getActionsForNavDescriptor(descriptor));
    });
}

const login = function(params, next) {


  userService.findLogin(params.username, params.password, function (err, user) {
    if (!user) {
      res.status(401).send("The username or password don't match");
      return;
    }
    console.log(user);
    next([]);
  });


};

const serviceMap = {
  navigation: createNavigationActions,
  login:login
}


/* GET home page. */
router.post('/ACTIONS', function (req, res) {
  var service = serviceMap[req.body.service];
  if (service != null) {
    service(req.body.params, function (result) {
      res.json(result)
    })
  }else{
    console.error("Service with id: " + req.body.service + " was not found!");
  }

});

/* GET home page. */
router.post('/APP', function (req, res) {
  getNewState(req.body.access_token, null, function (state) {
    var pathname = "" + req.body.path;
    var elements = pathname.split("/");
    var app = elements.length > 1 ? elements[1] : null;
    var screen = elements.length > 2 ? elements[2] : null;
    res.json(state)
  });
});


router.post('/Screen', function (req, res) {
  getScreenData(req.body.access_token, req.body.appName, req.body.screenKey, function (screenData) {
    if (screenData === null || screenData === undefined) {
      res.json(screenDataError('No such page available'));
    } else {
      res.json(receiveScreenData({layout: screenData.definition}));
    }
  });
});

module.exports = router;
