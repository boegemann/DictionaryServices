var mongoose = require("mongoose");

var exports = module.exports = {};

const mongoUser = process.env.securityMongoUser;
const mongoPwd = process.env.securityMongoPwd;
const mongoUri = process.env.securityMongoUri;
const connectString = 'mongodb://' + mongoUser + ":" + mongoPwd + "@" + mongoUri;

var conn = mongoose.createConnection(connectString);

var userSchema = mongoose.Schema({
  username: String,
  password: String
});
var User = conn.model('users', userSchema);
conn.on('error', console.error.bind(console, 'connection error:'));

exports.findLogin = function (username, password, next) {
  User.findOne({username: username, password: password}, next);
};

