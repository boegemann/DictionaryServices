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
  definition: {
    text: String
  }
});

var Screen = conn.model('screens', screenSchema);


exports.getAppByName = function (appName, next) {
  Application.findOne({name: appName}, 'definition', next);
};

exports.getScreenIdByKey = function (appName, screenKey, next) {
  mongoose.set("debug", true);
  console.log("-->")
  Application.findOne({name: appName}, "definition.screens", function (err, doc) {
    doc = doc.toObject();
    var result = null;
    if (doc != null && doc.definition.screens != null) {
      var results = doc.definition.screens.filter(function (screen) {
        return screen.key === screenKey
      });
      if (results.length > 0) {
        console.log("Found screen Id: " + results[0].screen)
        Screen.findById(results[0].screen, function (err, screen) {
          if (screen == null) {

            console.log("No screen  ")
            next(null)
          } else {
            console.log("Found screen  " + screen)
            next(screen.toObject());
          }
        });
      } else {
        next(null);
      }
    } else {
      next(null);
    }
  });
  mongoose.set("debug", false);
}

exports.getScreenById = function (screenId, next) {
  Screen.findOne({_id: screenId}, 'definition', next);
};



