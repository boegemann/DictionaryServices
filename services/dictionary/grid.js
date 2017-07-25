var createNavigationActions = require("../../uimanagement/ApplicationState").createNavigationActions;
var exports = module.exports = {};

const url = process.env.dictionaryServiceUrl;

var request = require('request');

function callDictionaryService(serviceName, descriptor, next) {

  request({
    headers: {
      'jwt_token': descriptor.token,
      'Content-Type': 'application/json'
    },
    uri: url + serviceName,
    method: 'GET'
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      try {
        var result = JSON.parse(body);
        next(result);
      } catch (err) {
        console.error(err);
        next(null);
      }
    } else {
      console.error(error);
      next(null);
    }
  });
}

exports.createNavigationActions = function (params, token, currentPath, next) {
  getNavigationDescriptor(
    params.oldPath,
    params.newPath,
    params.data,
    token
    , function (descriptor) {
      next(getActionsForNavDescriptor(descriptor));
    });
};

exports.showDictionaryEntry = function (params, token, currentPath, next) {
  var key = (params.rowData.section + "_" + params.rowData.key).replace(/\./g, '_');
  var navParams = {
    oldPath: currentPath,
    newPath: params.eventInfo.screenUrl + "/" + key,
    data: null
  };
  createNavigationActions(navParams, token, currentPath, next);
};

exports.getInitialData = function (descriptor, next) {
  callDictionaryService('initialdata', descriptor, next);
};
exports.getInitialColumns = function (descriptor, next) {
  callDictionaryService('languages', descriptor, function (languages) {
    var columns = [
      {
        "name": "Section",
        "dataIndex": "section",
        "width": "80px"
      }, {
        "name": "Key",
        "dataIndex": "key",
        "width": "50px"
      }
    ];
    if (languages != null) {
      Object.getOwnPropertyNames(languages).forEach(function (key) {
        columns.push(
          {
            "name": languages[key],
            "dataIndex": key,
            "width": "50px"
          }
        )
      });
    }
    next(columns)
  });
};


exports.getEntryData = function (descriptor, next) {
  var key = descriptor.newKey;
  if (key !== null) {
    var keyParts = key.split("_");
    if (keyParts.length < 2) {
      next({});
    } else {
      var dicKey = keyParts.pop();
      var section = keyParts.join(".");
      next({
        section: section,
        key: dicKey
      });
    }
  } else {
    next({});
  }
}
