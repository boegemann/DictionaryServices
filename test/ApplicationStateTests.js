var applicationStateModule = require("../uimanagement/ApplicationState");
var security = require('../security/jwt');
var assert = require('assert');

const testUser = "gonto";


describe('ApplicationState', function () {
  describe('getActionsForPathChange', function () {
    it('User should be null if no token provided', function (done) {
      applicationStateModule.getActionsForPathChange(null, "", null, function (descriptor) {
        if (descriptor == null) {
          done(new Error("No descriptor returned"));
        } else if (descriptor.user !== null) {
          done(new Error("User is not null"));
        } else {
          done();
        }
      })
    });

    it('User should be populated if token is valid', function (done) {
      var token = security.createAccessToken({
        username: testUser,
        roles: ["admin"],
        permissions: ["app:DictionaryManager"]
      });

      applicationStateModule.getActionsForPathChange(null, "", token, function (descriptor) {
        if (descriptor == null) {
          done(new Error("No descriptor returned"));
        } else if (descriptor.user !== null) {
          assert(descriptor.user.username === testUser, "Wrong user name returned");
          assert(descriptor.user.roles.indexOf("admin") >= 0, "No admin role present");
          assert(descriptor.user.permissions.indexOf("app:DictionaryManager") >= 0, "No DictionaryManager permission present");
          done();
        } else {
          done(new Error("User is null"));
        }
      })
    });

    it('It should be contain the correct application details if app exists and user has permissions', function (done) {
      var token = security.createAccessToken({
        username: testUser,
        roles: ["admin"],
        permissions: ["app:DictionaryManager"]
      });

      applicationStateModule.getActionsForPathChange(null, "/DictionaryManager/home", token, function (descriptor) {
        if (descriptor == null) {
          done(new Error("No descriptor returned"));
        } else if (descriptor.app !== null) {
          assert(descriptor.app != null, "No app returned");
          assert(descriptor.app.name == 'DictionaryManager', "Wrong app returned");
          done();
        } else {
          done(new Error("User is null"));
        }
      })
    });

    it("It should be return an error if the user has not got the correct permissions", function (done) {
      var token = security.createAccessToken({
        username: testUser,
        roles: ["admin"],
        permissions: ["app:SomethingElse"]
      });

      applicationStateModule.getActionsForPathChange(null, "/DictionaryManager/home", token, function (descriptor) {
        if (descriptor == null) {
          done(new Error("No descriptor returned"));
        } else {
          assert(descriptor.app == null, "App object was still returned");
          assert(descriptor.errors.length > 0, "No errors returned");
          done();
        }
      })
    });
  });
});
