var security = require('../security/jwt');
var appService = require('../services/application');


var exports = module.exports = {};

exports.getScreenData = function (token, appName, screenKey, next) {
  security.verifyToken(token).then(function (result) {
    var hasAccess = result === security.VALID;
    security.verifyToken(token).then(function (result) {
      appService.getScreenIdByKey(appName, screenKey, next);
    })
  });
};

