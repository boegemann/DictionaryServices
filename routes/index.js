var express = require('express');
var router = express.Router();
var security = require("../security/jwt");
var getNewState = require("../application/ApplicationState").getNewState

/* GET home page. */
router.post('/APP', function (req, res) {
  security.verifyToken(req.body.access_token).then(function (result) {
    var hasAccess = result === security.VALID;

    res.json(getNewState(hasAccess, req.body.access_token));


  })
});

module.exports = router;
