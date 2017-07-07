var express = require('express');
var router = express.Router();
var security = require("../security/jwt");
var getNewState = require("../application/ApplicationState").getNewState

/* GET home page. */
router.post('/APP', function (req, res) {

    getNewState( req.body.access_token, function(state){
      res.json(state)
    });


});

module.exports = router;
