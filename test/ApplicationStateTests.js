var applicationStateModule = require("../uimanagement/ApplicationState");
var security = require('../security/jwt');
var assert = require('assert');

const testUser = "gonto";

function createTestUserToken() {
  return security.createAccessToken({
    username: testUser,
    roles: ["admin"],
    permissions: ["app:DictionaryManager", "screen:DictionaryManager:*"]
  });
}


describe('ApplicationState', function () {
  describe('getNavigationDescriptor', function () {
    it('User should be null if no token provided', function (done) {
      applicationStateModule.getNavigationDescriptor(null, "", null, null, null, function (descriptor) {
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

      applicationStateModule.getNavigationDescriptor(null, "", null, null, token, function (descriptor) {
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

      applicationStateModule.getNavigationDescriptor(null, "/DictionaryManager/home", null, null, token, function (descriptor) {
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

      applicationStateModule.getNavigationDescriptor(null, "/Somewhere/sometime", null, null, token, function (descriptor) {
        if (descriptor == null) {
          done(new Error("No descriptor returned"));
        } else if (descriptor.app !== null) {
          assert(descriptor.app.name == 'WcgPortal', "Wrong app returned");
          assert(descriptor.notifications.length > 0);
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


      applicationStateModule.getNavigationDescriptor(null, "/DictionaryManager/home", null, null, token, function (descriptor) {
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

      applicationStateModule.getNavigationDescriptor(null, "/DictionaryManager/notascreen", null, null, token, function (descriptor) {
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
        permissions: ["app:DictionaryManager", "screen:DictionaryManager:nothome"]
      });

      applicationStateModule.getNavigationDescriptor(null, "/DictionaryManager/home", null, null, token, function (descriptor) {
        if (descriptor == null) {
          done(new Error("No descriptor returned"));
        } else {
          assert(descriptor.screen == null, "Screen object was still returned");
          assert(descriptor.errors.length > 0, "No errors returned");
          done();
        }
      })
    });

    it("It should however return the app object if the user is not logged in", function (done) {
      applicationStateModule.getNavigationDescriptor(null, "/DictionaryManager/home", null, null, null, function (descriptor) {
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

    it("If the user is not logged in it should return the login screen object", function (done) {
      applicationStateModule.getNavigationDescriptor(null, "/DictionaryManager/home", null, null, null, function (descriptor) {
        if (descriptor == null) {
          done(new Error("No descriptor returned"));
        } else {
          assert(descriptor.screen != null, "Screen object was not returned");
          assert(descriptor.screen.name === "Login", "Wrong screen returned");
          done();
        }
      })
    });

    it("If everything else is ok, it should return the correct screen object", function (done) {
      var token = createTestUserToken();
      applicationStateModule.getNavigationDescriptor(null, "/DictionaryManager/home", null, null, token, function (descriptor) {
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

  describe('getActionsForNavDescriptor', function () {
    it('should return a REDIRECT if the oldPath was empty or different to the new path', function (done) {
      var token = createTestUserToken();
      applicationStateModule.getNavigationDescriptor(null, "/DictionaryManager/home", null, null, token, function (descriptor) {
        var actions = applicationStateModule.getActionsForNavDescriptor(descriptor);
        assert(actions.length > 0, "No actions returned");
        if (actions.length > 0) {
          assert(actions[0].type = "REDIRECT")
        }
        done();
      })
    })
  })

});
