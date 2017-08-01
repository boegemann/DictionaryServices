var createNavigationActions = require("../../uimanagement/ApplicationState").createNavigationActions;
var userService = require("../../dao/users");
var security = require("../../security/jwt");

var exports = module.exports = {};


exports.login = function (params, token, currentPath, next) {
  userService.findLogin(params.username, params.password, function (err, user) {
    if (!user) {
      var nextNavigation = {
        oldPath: params.nextPath,
        newPath: currentPath,
        data: {errorMessage:"The username or password don't match"}
      }
      createNavigationActions(nextNavigation, null,  next);
    }else{
      var token = security.createAccessToken(user);
      var nextNavigation = {
        oldPath: currentPath,
        newPath: params.nextPath,
        data: null
      }
      createNavigationActions(nextNavigation, token,  next);
    }
  });
};
