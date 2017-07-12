var security = require('../security/jwt')
var appService = require('../services/application')


var exports = module.exports = {}

exports.getScreenData = function (token, appName, screenKey, next) {

  security.verifyToken(token).then(function (result) {

    var userId = hasAccess ? security.getUserId(token) : security.ANONYMOUS;

    var screenId = hasAccess ? "DictionaryManager" : security.ANONYMOUS;

    appService.getScreenIdByKey(appName,screenKey,next);

  })
};

