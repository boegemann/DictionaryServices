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


const getService = function (serviceDescriptor) {
    // UI Service and not dynamically required but will need to remove currentPath from params
    if (serviceDescriptor === "navigation") return function (params, token, currentPath, locale, next) {
        params.locale = locale;
        createNavigationActions(params, token, next)
    }
    try {
        var serviceStringArray = serviceDescriptor.split(":");
        var service = require('../services/' + serviceStringArray[0])[serviceStringArray[1]];
        return service;
    } catch (e) {
        return null;
    }
}


/* GET home page. */
router.post('/ACTIONS', function (req, res) {
    // either we have already set our cookie or we default to the browser locale
    var locale = req.body.locale != null ? req.body.locale : req.headers["accept-language"].split(";")[0].split(",")[0];
    var service = getService(req.body.service);
    var token = security.verifyAndTouch(req.body.token);
    if (service != null) {
        service(req.body.params, token, req.body.currentPath, locale, function (result) {
            res.json(result)
        })
    } else {
        console.error("Service with id: " + req.body.service + " was not found!");
        res.status(500).send("Service with id: " + req.body.service + " was not found!")
    }

});


module.exports = router;
