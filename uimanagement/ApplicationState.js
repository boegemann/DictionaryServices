var security = require('../security/jwt');
var appDao = require('../dao/application');
var exports = module.exports = {};

const DEFAULT_APP = "WcgPortal";


// * @description determine if an array contains one or more items from another array.
// * @param {array} haystack the array to search.
// * @param {array} arr the array providing items to check for in the haystack.
// * @return {boolean} true|false if haystack contains at least one item from arr.
var findOne = function (haystack, arr) {
  return arr.some(function (v) {
    return haystack.indexOf(v) >= 0;
  });
};

exports.getActionsForPathChange = function (oldPath, newPath, token, next) {
  var newPathElements = ("" + newPath).split("/");
  var oldPathElements = ("" + oldPath).split("/");
  var descriptor = {
    token: token,
    oldPath: oldPath,
    newPath: newPath,
    newAppName: newPathElements.length > 1 ? newPathElements[1] : null,
    newScreenName: newPathElements.length > 2 ? newPathElements[2] : null,
    oldAppName: oldPathElements.length > 1 ? oldPathElements[1] : null,
    oldScreenName: oldPathElements.length > 2 ? oldPathElements[2] : null,
    errors: [],
    warnings: [],
    notifications: [],
    app: null,
    screen: null,
    user: null
  };

  addUserInfo(descriptor, next);
};

function addUserInfo(descriptor, next) {
  security.verifyToken(descriptor.token).then(function (access) {
    descriptor.user = access === security.VALID ? security.getUser(descriptor.token) : null;
    addAppInfo(descriptor, next);
  });
}

function addAppInfo(descriptor, next) {

  if (descriptor.newAppName === null || descriptor.newAppName.trim() === "") {
    descriptor.newAppName = DEFAULT_APP;
  }
  appDao.getAppByName(descriptor.newAppName, function (app) {
    if (app === null) {
      if (descriptor.newAppName !== DEFAULT_APP) {
        descriptor.notifications.push("Can't find application named: " + descriptor.appName + ". Navigating to default application.");
        descriptor.newAppName = DEFAULT_APP;
        // change to default app and try again
        addAppInfo(descriptor, next);
      } else {
        descriptor.errors.push("Can't find default application definition");
        next(descriptor);
      }
    } else {
      // check whether app allows anonymous access or user has reqauired permisssions
      if (app.hasOwnProperty("acceptedPermissions") && app.acceptedPermissions.length > 0 &&
        (descriptor.user === null || !findOne(app.acceptedPermissions, descriptor.user.permissions))) {
        descriptor.errors.push("Access to the application is denied");
        next(descriptor);
      } else {
        descriptor.app = app;
        addScreenInfo(descriptor, next);
      }
    }
  }, function (err) {
    descriptor.errors.push(err);
    next(descriptor);
  });
}


function addScreenInfo(descriptor, next) {
  if (descriptor.newScreenName == null) {
    descriptor.newScreenName = descriptor.app.defaultScreen;
  }

  var appScreenDefintion = descriptor.app.definition.screens.filter(function (screen) {
    return screen.key === descriptor.newScreenName
  });
  if (appScreenDefintion.length===0) {
    descriptor.errors.push("Screen is not available");
    next(descriptor);
  } else {
    appScreenDefintion=appScreenDefintion[0];
    appDao.getScreenIdByKey(descriptor.app.name, descriptor.newScreenName, function (screen) {
      if (screen == null) {
        descriptor.errors.push("Screen is not available");
        next(descriptor);
      } else if (appScreenDefintion.hasOwnProperty("acceptedPermissions") && appScreenDefintion.acceptedPermissions.length > 0 &&
        (descriptor.user === null || !findOne(appScreenDefintion.acceptedPermissions, descriptor.user.permissions))) {
        descriptor.errors.push("Access to the screen is denied");
        next(descriptor);
      } else {
        descriptor.screen = screen;
        next(descriptor);
      }
    });
  }

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

