var security = require('../security/jwt');
var appDao = require('../dao/application');
var userDao = require('../dao/users');
var exports = module.exports = {};

const DEFAULT_APP = "WcgPortal";

exports.getActionsForPathChange = function (oldPath, newPath, token, next) {
  var newPathElements = ("" + newPath).split("/");
  var oldPathElements = ("" + oldPath).split("/");
  var descriptor = {
    token: token,
    newAppName: newPathElements.length > 1 ? elements[1] : null,
    newScreenName: newPathElements.length > 2 ? elements[2] : null,
    oldAppName: oldPathElements.length > 1 ? elements[1] : null,
    oldScreenName: oldPathElements.length > 2 ? elements[2] : null,
    errors: [],
    warnings: [],
    notifications: [],
    app: null,
    screen: null,
    user: null,
    permissions: []
  };

  addUserInfo(descriptor, next);
};

function addUserInfo(descriptor, next) {
  security.verifyToken(descriptor.token).then(function (access) {
    if (access === security.VALID) {
      var userId = security.getUserId(descriptor.token);
      userDao.findUserByName(userId, function (err, user) {
        if (err) {
          descriptor.errors.push(err);
          next(descriptor);
        } else {
          descriptor.user = user;
          addAppInfo(descriptor, next);
        }
      });
    } else {
      addAppInfo(descriptor, next);
    }
  });
}

function addAppInfo(descriptor, next) {

  var appName = descriptor.newAppName;
  if (descriptor.newAppName === null || descriptor.newAppName.trim() === "") {
    descriptor.newAppName = DEFAULT_APP;
  }
  appDao.getAppByName(appName, function (app) {
    if (app === null) {
      if (descriptor.newAppName !== DEFAULT_APP) {
        descriptor.notifications.push("Can't find application named: " + descriptor.appName + ". Navigating to default application.");
        descriptor.newAppName = DEFAULT_APP;
        // change to default app and try again
        addAppInfo(descriptor, next);
      } else {
        descriptor.errors.push("Can't find default application definition")
        next(descriptor);
      }
    } else {
      descriptor.app = app;
      next(descriptor);
    }
  });
}


function validateNewPath(descriptor, result, next, err) {
  var appName = newPath.app;
  var result = {}
  if (appName === null || appName.trim() === "") {
    appName = DEFAULT_APP;
  }
  appDao.getAppByName(appName, function (app) {
    if (app === null) {
      if (appName !== DEFAULT_APP) {
        console.warn("Can't find application: " + appName);
        validateNewPath(DEFAULT_APP, next);
      } else {
        console.error("Can't find default application definition");
        err("Can't connect to Application");
      }
    }
  })
}


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

    appDao.getAppByName(appName, function (err, appInfo) {

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

