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
      var token = security.createAccessToken({username: testUser});
      applicationStateModule.getActionsForPathChange(null, "", token, function (descriptor) {
        if (descriptor == null) {
          done(new Error("No descriptor returned"));
        } else if (descriptor.user !== null) {
          assert(descriptor.user.username === testUser, "Wrong user name returned");
          assert(descriptor.user.roles.indexOf("admin") >= 0, "No admin role present");
          done();
        } else {
          done(new Error("User is null"));
        }
      })
    });
  });
});
