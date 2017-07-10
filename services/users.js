var mongoose = require("mongoose");

var exports = module.exports = {}

// ds147052.mlab.com:47052/dictionarymongo

const mongoUser = process.env.securityMongoUser;
const mongoPwd = process.env.securityMongoPwd;
const mongoUri = process.env.securityMongoUri;
const connectString = 'mongodb://' + mongoUser + ":" + mongoPwd + "@" + mongoUri;


var userSchema = mongoose.Schema({
  username: String,
  password: String
});

var User = mongoose.model('users', userSchema);
mongoose.connect(connectString);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

exports.findLogin = function (username, password, next) {
  User.findOne({username: username, password: password}, next)

}

