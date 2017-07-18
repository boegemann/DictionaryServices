var mongoose = require("mongoose");

var exports = module.exports = {};

const mongoUser = process.env.applicationMongoUser;
const mongoPwd = process.env.applicationMongoPwd;
const mongoUri = process.env.applicationMongoUri;
const connectString = 'mongodb://' + mongoUser + ":" + mongoPwd + "@" + mongoUri;

var conn = mongoose.createConnection(connectString);

conn.on('error', console.error.bind(console, 'connection error:'));

var appSchema = mongoose.Schema({
  name: String,
  definition: {
    title: String,
    header: {
      title: String
    },
    screens: [{key: String, screen: mongoose.Schema.Types.ObjectId}]
  }
});

var Application = conn.model('apps', appSchema);

var screenSchema = mongoose.Schema({
  name: String,
  definition: [mongoose.Schema.Types.Mixed]
});

var Screen = conn.model('screens', screenSchema);

exports.getScreenIdByKey = function (appName, screenKey, next) {
  Application.findOne({name: appName}, "definition.screens", function (err, doc) {
    doc = doc.toObject();
    if (doc !== null && doc !== undefined && doc.definition.screens !== null && doc.definition.screens !== null) {
      var results = doc.definition.screens.filter(function (screen) {
        return screen.key === screenKey
      });
      if (results.length > 0) {
        Screen.findById(results[0].screen, function (err, screen) {
          next((screen === null || screen === undefined) ? null : screen.toObject());
        });
      } else {
        next(null);
      }
    } else {
      next(null);
    }
  });
};

exports.getScreenById = function (screenId, next) {
  Screen.findOne({_id: screenId}, 'definition', next);
};

exports.getAppByName = function (appName, next, err) {
  Application.findOne({name: appName}, function (error, app) {
    if (error) {
      if (err) {
        err(error);
      }
    } else {
      next((app === null || app === undefined) ? null : app.toObject);
    }
  });
};

