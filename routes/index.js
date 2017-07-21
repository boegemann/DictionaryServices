var express = require('express');
var router = express.Router();
var security = require("../security/jwt");
var userService = require("../dao/users")

var getActionsForNavDescriptor = require("../uimanagement/ApplicationState").getActionsForNavDescriptor;
var getNavigationDescriptor = require("../uimanagement/ApplicationState").getNavigationDescriptor;


const createNavigationActions = function (params, token, currentPath, next) {
  getNavigationDescriptor(
    params.oldPath,
    params.newPath,
    params.data,
    token
    , function (descriptor) {
      next(getActionsForNavDescriptor(descriptor));
    });
};

const login = function (params, token, currentPath, next) {
  userService.findLogin(params.username, params.password, function (err, user) {
    if (!user) {
      var nextNavigation = {
        oldPath: params.nextPath,
        newPath: currentPath,
        data: {errorMessage:"The username or password don't match"}
      }
      createNavigationActions(nextNavigation, null, currentPath, next);
    }else{
      var token = security.createAccessToken(user);
      var nextNavigation = {
        oldPath: currentPath,
        newPath: params.nextPath,
        data: null
      }
      createNavigationActions(nextNavigation, token, currentPath, next);
    }
  });
};

const serviceMap = {
  navigation: createNavigationActions,
  login: login
};


/* GET home page. */
router.post('/ACTIONS', function (req, res) {
  var service = serviceMap[req.body.service];
  var token = security.verifyAndTouch(req.token);
  if (service != null) {
    service(req.body.params, token, req.body.currentPath, function (result) {
      res.json(result)
    })
  } else {
    console.error("Service with id: " + req.body.service + " was not found!");
  }

});


module.exports = router;
