var mongoose = require("mongoose");

var exports = module.exports = {};

const mongoUser = process.env.securityMongoUser;
const mongoPwd = process.env.securityMongoPwd;
const mongoUri = process.env.securityMongoUri;
const connectString = 'mongodb://' + mongoUser + ":" + mongoPwd + "@" + mongoUri;

var conn = mongoose.createConnection(connectString);

var userSchema = mongoose.Schema({
  username: String,
  password: String,
  roles: [String]
});
var User = conn.model('users', userSchema);

var roleSchema = mongoose.Schema({
  name: String,
  permissions: [String]
});
var Role = conn.model('roles', roleSchema);

conn.on('error', console.error.bind(console, 'connection error:'));

function resolveUserObject(userModel) {
  if (userModel !== null && userModel !== undefined) {
    return userModel.toObject();
  } else {
    return null
  }
}

exports.findLogin = function (username, password, next) {
  User.findOne({username: username, password: password}, function (err, user) {
    user = resolveUserObject(user);
    if (user != null && err === null) {
      if (user.roles == null) {
        user.roles = [];
      }
      if (user.roles.length > 0) {
        Role.find({"name": {"$in": user.roles}}, function (err, roles) {
          console.log(roles);
          user.permissions = [];
          if (roles !== null) {
            roles.map(function (rm) {
              return rm.toObject();
            }).forEach(function (r) {
              user.permissions.push.apply(user.permissions, r.permissions); // faster and neater than concat
            });
            next(err, user);
          }
        });
      } else {
        next(err, user);
      }
    } else {
      next(err, user);
    }
  });
};
exports.findUserByName = function (username, next) {
  User.findOne({username: username}, function (err, user) {
    user = resolveUserObject(user);
    next(err, user);
  });
};

