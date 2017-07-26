var security = require('../security/jwt');
var appDao = require('../dao/application');
var exports = module.exports = {};

const DEFAULT_APP = "WcgPortal";


// determine if an array contains one or more items from another array.
var findOne = function (haystack, arr) {
  return arr.some(function (v) {
    return haystack.indexOf(v) >= 0;
  });
};

exports.createNavigationActions = function (params, token, currentPath, next) {
  getNavigationDescriptor(
    params.oldPath,
    params.newPath,
    params.data,
    params.serviceData,
    token
    , function (descriptor) {
      next(getActionsForNavDescriptor(descriptor));
    });
};

function getActionsForNavDescriptor(descriptor) {
  var actions = [];
  var app = null;
  var header = null;
  var screen = null;

  // any navigation requires an entry in the app section to force navigation
  if ((descriptor.newAppName !== null && descriptor.newScreenName !== null) &&
    descriptor.newAppName !== descriptor.oldAppName ||
    descriptor.newScreenName !== descriptor.oldScreenName ||
    descriptor.newKey !== descriptor.newKey) {
    app = {
      navigation: {
        currentUrl: "/" + descriptor.newAppName + "/" + descriptor.newScreenName + (descriptor.newKey !== null ? "/" + descriptor.newKey : ""),
        pausedPath: descriptor.pausedPath
      },
      title: descriptor.app.definition.title,
      security: {
        token: descriptor.token
      }
    }
  }

  // next check whether we need a header change, this requires a change of applications:
  if (descriptor.app !== null &&
    descriptor.newAppName !== descriptor.oldAppName) {
    header = descriptor.app.definition.header
  }

  // and now the screen
  if (descriptor.screen !== null &&
    descriptor.newScreenName !== descriptor.oldScreenName) {
    screen = descriptor.screen.definition
  }

  actions.push({
    type: "SERVER_ACTION",
    app: app,
    header: header,
    screen: screen,
    data: descriptor.data
  });
  return actions;
}

exports.getActionsForNavDescriptor = getActionsForNavDescriptor;

function getNavigationDescriptor(oldPath, newPath, data, serviceData, token, next) {
  var newPathElements = ("" + newPath).split("/");
  var oldPathElements = ("" + oldPath).split("/");
  var descriptor = {
    token: token,
    oldPath: oldPath,
    newPath: newPath,
    pausedPath: null,
    newAppName: newPathElements.length > 1 ? newPathElements[1] : null,
    newScreenName: newPathElements.length > 2 ? newPathElements[2] : null,
    newKey: newPathElements.length > 3 ? newPathElements[3] : null,
    oldAppName: oldPathElements.length > 1 ? oldPathElements[1] : null,
    oldScreenName: oldPathElements.length > 2 ? oldPathElements[2] : null,
    oldKey: oldPathElements.length > 3 ? oldPathElements[3] : null,
    errors: [],
    warnings: [],
    notifications: [],
    app: null,
    screen: null,
    data: data != null ? data : {},
    serviceData: serviceData != null ? serviceData : {},
    user: token !== null ? security.getUser(token) : null
  };

  addAppInfo(descriptor, next);
}

exports.getNavigationDescriptor = getNavigationDescriptor


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
      // note we not rejecting an anonymous user and postpone the handling of this in screens to allow for a redirect to login
      if (app.hasOwnProperty("acceptedPermissions") && app.acceptedPermissions.length > 0 &&
        (descriptor.user !== null && !findOne(app.acceptedPermissions, descriptor.user.permissions))) {
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
  if (descriptor.newScreenName === null || descriptor.newScreenName.trim() === "") {
    descriptor.newScreenName = descriptor.app.defaultScreen;
  }

  var appScreenDefintion = descriptor.app.definition.screens.filter(function (screen) {
    return screen.key === descriptor.newScreenName
  });
  if (appScreenDefintion.length === 0) {
    descriptor.errors.push("Screen is not available");
    next(descriptor);
  } else {
    appScreenDefintion = appScreenDefintion[0];
    appDao.getScreenIdByKey(descriptor.app.name, descriptor.newScreenName, function (screen) {
      if (screen == null) {
        descriptor.errors.push("Screen is not available");
        next(descriptor);
      } else if ((appScreenDefintion.hasOwnProperty("acceptedPermissions") && appScreenDefintion.acceptedPermissions.length > 0) && descriptor.user === null && descriptor.app.loginScreen != null) {
        descriptor.pausedPath = "/" + descriptor.newAppName + "/" + descriptor.newScreenName + (descriptor.newKey !== null ? "/" + descriptor.newKey : "");
        descriptor.newScreenName = descriptor.app.loginScreen;
        addScreenInfo(descriptor, next);
      } else if (appScreenDefintion.hasOwnProperty("acceptedPermissions") && appScreenDefintion.acceptedPermissions.length > 0 &&
        (descriptor.user === null || !findOne(appScreenDefintion.acceptedPermissions, descriptor.user.permissions))) {
        descriptor.errors.push("Access to the screen is denied");
        next(descriptor);
      } else {
        if ((descriptor.app.loginScreen === descriptor.newScreenName) && descriptor.pausedPath === null) {
          descriptor.pausedPath = "/" + descriptor.newAppName + "/" + descriptor.app.defaultScreen + (descriptor.newKey !== null ? "/" + descriptor.newKey : "");
        }
        descriptor.screen = screen;
        if (screen.services!=null) {
          populateServiceData(screen.services, descriptor, next);
        } else {
          next(descriptor);
        }
      }
    });
  }
}

const populateServiceData = function (services, descriptor, next) {
  if (services.length > 0) {
    var serviceDescriptor = services.pop();
    var serviceStringArray = serviceDescriptor.service.split(":");
    var service = require('../services/' + serviceStringArray[0])[serviceStringArray[1]];
    service(descriptor, function (data) {
      var storageLocationArray = serviceDescriptor.storage.split(":");
      if (storageLocationArray[0] === "data") {
        parentObject = descriptor.data;
        storageLocationPathArray = storageLocationArray[1].split(".");
        var lastPath = storageLocationPathArray.pop();
        storageLocationPathArray.forEach(function (path) {
          if (parentObject[path] == null) {
            parentObject[path] = {};
          }
          parentObject = parentObject[path];
        });
        parentObject[lastPath] = data;
        populateServiceData(services, descriptor, next);
      } else {
        next(descriptor);
      }
    });
  } else {
    next(descriptor);
  }
};

