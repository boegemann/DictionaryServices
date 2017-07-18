var express = require('express');
var router = express.Router();
var security = require("../security/jwt");
var getNewState = require("../uimanagement/ApplicationState").getNewState;

var getScreenData = require("../uimanagement/Screens").getScreenData;

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


/* GET home page. */
router.post('/APP', function (req, res) {
  getNewState(req.body.access_token, null, function (state) {
    var pathname = "" + req.body.path;
    var elements = pathname.split("/");
    var app = elements.length>1?elements[1]:null;
    var screen = elements.length>2?elements[2]:null;
    res.json(state)
  });
});10


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
