var security = require('../security/jwt');
var appService = require('../dao/application');


var exports = module.exports = {};

exports.getScreenData = function (token, appName, screenKey, next) {
  security.verifyToken(token).then(function (result) {
    console.log("TODO: Check user access for " + result);
    appService.getScreenIdByKey(appName, screenKey, next);
  });
};

