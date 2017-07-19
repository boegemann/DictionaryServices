var userDao = require("../dao/users");
var security = require('../security/jwt');
var assert = require('assert');


const testUser = "gonto";
const testPassword = "gonto";


describe('UserDAO', function () {
  describe('findLogin', function () {
    it('Provided the right credentials it should return a user, his roles and permissions', function (done) {
      userDao.findLogin(testUser, testPassword, function (err, user) {
        if (user == null) {
          done(new Error("No user found"));
        } else if (user.roles === null || user.roles.size === 0) {
          done(new Error("User has got no roles returned"));
        } else if (user.permissions === null || user.permissions.size === 0) {
          done(new Error("User has got no permissions returned"));
        }else{
          done();
        }
      })
    });
  });
});
