var express = require('express');
var router = express.Router();
var security = require("../security/jwt");


var createNavigationActions = require("../uimanagement/ApplicationState").createNavigationActions;



// const serviceMap = {
//   navigation: createNavigationActions,
//   login: login,
//   showDictionaryEntry:showDictionaryEntry,
//   dictionaryFilter:dictionaryFilter
// };


const getService = function (serviceDescriptor){
  if (serviceDescriptor==="navigation") return createNavigationActions // UI Service and not dynamically required
  try{
    var serviceStringArray = serviceDescriptor.split(":");
    var service = require('../services/' + serviceStringArray[0])[serviceStringArray[1]];
    return service;
  }catch(e){
    return null;
  }
}


/* GET home page. */
router.post('/ACTIONS', function (req, res) {
  var service = getService(req.body.service);
  var token = security.verifyAndTouch(req.body.token);
  if (service != null) {
    service(req.body.params, token, req.body.currentPath, function (result) {
      res.json(result)
    })
  } else {
    console.error("Service with id: " + req.body.service + " was not found!");
    res.status(500).send("Service with id: " + req.body.service + " was not found!")
  }

});


module.exports = router;
