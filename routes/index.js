var express = require('express');
var router = express.Router();
var security = require("../security/jwt");
var userService = require("../dao/users")

var getActionsForNavDescriptor = require("../uimanagement/ApplicationState").getActionsForNavDescriptor;
var getNavigationDescriptor = require("../uimanagement/ApplicationState").getNavigationDescriptor;


const createNavigationActions = function (params, token, next) {
  getNavigationDescriptor(
    params.oldPath,
    params.newPath,
    token
    , function (descriptor) {
      next(getActionsForNavDescriptor(descriptor));
    });
};

const login = function (params, token, next) {
  userService.findLogin(params.username, params.password, function (err, user) {
    if (!user) {
      res.status(401).send("The username or password don't match");
      return;
    }
    var token = security.createAccessToken(user);
    var nextNavigation = {
      oldPath: "",
      newPath: params.nextPath,
    }
    createNavigationActions(nextNavigation, token, next);
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
    service(req.body.params, token, function (result) {
      res.json(result)
    })
  } else {
    console.error("Service with id: " + req.body.service + " was not found!");
  }

});


module.exports = router;
