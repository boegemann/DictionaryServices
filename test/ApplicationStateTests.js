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



