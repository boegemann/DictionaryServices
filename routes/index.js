var express = require('express');
var router = express.Router();
var security = require("../security/jwt");
var getNewState = require("../application/ApplicationState").getNewState;

var getScreenData = require("../application/Screens").getScreenData;

/* GET home page. */
router.post('/APP', function (req, res) {
  getNewState(req.body.access_token, function (state) {
    res.json(state)
  });
});

router.post('/Screen', function (req, res) {
  getScreenData(req.body.access_token, req.body.appName, req.body.screenKey, function (screenData) {
    if (screenData==null){
      res.json({text:'No such page available'});
    }else{
      res.json({layout:screenData.definition});
    }
  });
});

module.exports = router;
