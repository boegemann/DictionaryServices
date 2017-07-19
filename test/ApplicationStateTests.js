var applicationStateModule = require("../uimanagement/ApplicationState");
var security = require('../security/jwt');
var assert = require('assert');

const testUser = "gonto";

function createTestUserToken(){
  return security.createAccessToken({
    username: testUser,
    roles: ["admin"],
    permissions: ["app:DictionaryManager","screen:DictionaryManager:*"]
  });
}


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
      var token = createTestUserToken();

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
      var token = createTestUserToken();

      applicationStateModule.getActionsForPathChange(null, "/DictionaryManager/home", token, function (descriptor) {
        if (descriptor == null) {
          done(new Error("No descriptor returned"));
        } else if (descriptor.app !== null) {
          assert(descriptor.app.name == 'DictionaryManager', "Wrong app returned");
          done();
        } else {
          done(new Error("No app returned"));
        }
      })
    });

    it('It should populate the default app if the requested application is missing or not existent', function (done) {
      var token = createTestUserToken();

      applicationStateModule.getActionsForPathChange(null, "/Somewhere/sometime", token, function (descriptor) {
        if (descriptor == null) {
          done(new Error("No descriptor returned"));
        } else if (descriptor.app !== null) {
          assert(descriptor.app.name == 'WcgPortal', "Wrong app returned");
          assert(descriptor.notifications.length>0);
          done();
        } else {
          done(new Error("No app returned"));
        }
      })
    });

    it("It should return an error if the user has not got the correct permissions", function (done) {
      var token = security.createAccessToken({
        username: testUser,
        roles: ["admin"],
        permissions: ["app:NotDicManager"]
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

    it("It should return an error if the requested screen is not available", function (done) {
      var token = createTestUserToken();

      applicationStateModule.getActionsForPathChange(null, "/DictionaryManager/notascreen", token, function (descriptor) {
        if (descriptor == null) {
          done(new Error("No descriptor returned"));
        } else {
          assert(descriptor.screen == null, "Screen object was still returned");
          assert(descriptor.errors.length > 0, "No errors returned");
          done();
        }
      })
    });

    it("It should return an error if the requested screen is not allowed to be accessed", function (done) {
      var token = security.createAccessToken({
        username: testUser,
        roles: ["admin"],
        permissions: ["app:DictionaryManager","screen:DictionaryManager:nothome"]
      });

      applicationStateModule.getActionsForPathChange(null, "/DictionaryManager/home", token, function (descriptor) {
        if (descriptor == null) {
          done(new Error("No descriptor returned"));
        } else {
          assert(descriptor.screen == null, "Screen object was still returned");
          assert(descriptor.errors.length > 0, "No errors returned");
          done();
        }
      })
    });

    it("If everything else is ok, it should return the correct screen object", function (done) {
      var token = createTestUserToken();
      applicationStateModule.getActionsForPathChange(null, "/DictionaryManager/home", token, function (descriptor) {
        if (descriptor == null) {
          done(new Error("No descriptor returned"));
        } else {
          assert(descriptor.screen != null, "Screen object was not returned");
          assert(descriptor.screen.name === "DictionaryHome", "Wrong screen returned");
          done();
        }
      })
    });
  });
});
