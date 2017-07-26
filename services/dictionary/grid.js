var createNavigationActions = require("../../uimanagement/ApplicationState").createNavigationActions;
var exports = module.exports = {};

const url = process.env.dictionaryServiceUrl;

var request = require('request');

function callDictionaryService(serviceName, descriptor, method, data, next) {

  var options = {
    headers: {
      'jwt_token': descriptor.token,
      'Content-Type': 'application/json',
      json: true
    },
    uri: url + serviceName,
    method: method
  }

  if (data != null) {
    options.json = data;
  }

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      try {
        var result = method === "POST" ? body : JSON.parse(body);
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

exports.showDictionaryEntry = function (params, token, currentPath, next) {
  var key = (params.rowData.section + "_" + params.rowData.key).replace(/\./g, '_');
  var navParams = {
    oldPath: currentPath,
    newPath: params.eventInfo.screenUrl + "/" + key,
    data: null
  };
  createNavigationActions(navParams, token, currentPath, next);
};

exports.getDictionaryData = function (descriptor, next) {
  var filter = descriptor.serviceData.dictionaryFilter == null ? {} : descriptor.serviceData.dictionaryFilter;
  callDictionaryService('filter', descriptor, "POST", filter, function (data) {
    next(data)
  });
};

exports.getInitialColumns = function (descriptor, next) {
  callDictionaryService('languages', descriptor, "GET", null, function (languages) {
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
    languages.forEach(function (language, index) {
      fields.push(
        {
          "name": language.name,
          "dataIndex": ["translations", index, "value"],
          "width": "50px"
        }
      )
    });
    next(columns)
  });
};

exports.entryLanguageFieldDef = function (descriptor, next) {

  callDictionaryService('languages', descriptor, "GET", null, function (languages) {
    fields = [];
    if (languages != null) {

      languages.forEach(function (language) {
        fields.push(
          [
            {
              "field": {
                "label": language.name + ":",
                "placeholder": language.name,
                "property": language.locale
              }
            }
          ]
        )
      });
    }
    next(fields)
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
};

exports.dictionaryFilter = function (params, token, currentPath, next) {
  var key = params.key;
  var section = params.section;

  var filter = {
    key: key === undefined ? null : key,
    section: section === undefined ? null : section
  };

  var navParams = {
    oldPath: currentPath,
    newPath: currentPath,
    serviceData: {dictionaryFilter: filter},
    data: null
  };
  createNavigationActions(navParams, token, currentPath, next);
}
