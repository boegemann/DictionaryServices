var express = require('express');
var router = express.Router();
var security = require("../security/jwt");
var getNewState = require("../application/ApplicationState").getNewState;

var getScreenData = require("../application/Screens").getScreenData;

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
    res.json(state)
  });
});


router.post('/Screen', function (req, res) {
  getScreenData(req.body.access_token, req.body.appName, req.body.screenKey, function (screenData) {
    if (screenData == null) {
      res.json(screenDataError('No such page available'));
    } else {
      res.json(receiveScreenData({layout: screenData.definition}));
    }
  });
});

module.exports = router;
