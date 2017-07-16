var security = require('../security/jwt');
var appService = require('../dao/application');


var exports = module.exports = {};

exports.getNewState = function (token, nextUrl, next) {

  security.verifyToken(token).then(function (result) {

    var hasAccess = result === security.VALID;
    var userId = hasAccess ? security.getUserId(token) : security.ANONYMOUS;


    var appName = hasAccess ? "DictionaryManager" : security.ANONYMOUS;
    var authSection = {
      isAuthenticated: hasAccess,
      accessToken: token,
      userId: userId
    };

    appService.getAppByName(appName, function (err, appInfo) {

      if (appInfo === null) {
        next(
          {
            "auth": authSection,
            "app": {},
            "error": "No such application"
          }
        )
      } else {
        appInfo = appInfo.toObject();
        appInfo.definition.screen = {"navigate": 'required'};
        next(
          {
            "auth": authSection,
            "app": {
              header: appInfo.definition.header,
              screen: {"navigate": 'required', "nextUrl": nextUrl},
              title: appInfo.definition.title,
              name: appInfo.name
            }
          }
        )
      }
    });
  })
};

