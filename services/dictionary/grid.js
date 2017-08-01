var createNavigationActions = require("../../uimanagement/ApplicationState").createNavigationActions;
var exports = module.exports = {};

const url = process.env.dictionaryServiceUrl;

var request = require('request');

function callDictionaryService(serviceName, token, method, data, next) {

  var options = {
    headers: {
      'jwt_token': token,
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
        console.log(body)
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


exports.saveDictionaryEntry = function (params, token, currentPath, next) {
  var key = (params.section + "_" + params.key).replace(/\./g, '_');

  callDictionaryService('saveDictionaryEntry', token, "POST", params, function (result) {
    console.log(">>>>")
    console.log(result)
    var navParams = {
      oldPath: currentPath,
      newPath: currentPath,
      data: null
    };
    createNavigationActions(navParams, token, currentPath, next);

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

exports.getInitialColumns = function (descriptor, next) {
  callDictionaryService('languages', descriptor.token, "GET", null, function (languages) {
    var columns = [{
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
      columns.push(
        {
          "name": language.name,
          "dataIndex": "" + language.id, // needs to be seen as an bject key rather than an index
          "width": "50px"
        }
      )
    });
    next(columns)
  });
};

exports.getDictionaryData = function (descriptor, next) {
  var filter = descriptor.serviceData.dictionaryFilter == null ? {} : descriptor.serviceData.dictionaryFilter;
  callDictionaryService('filter', descriptor.token, "POST", filter, function (data) {
    data = data.map(function (row) {
      return Object.assign(row, {id: row.section + "_" + row.key})
    })
    next(data)
  });
};

exports.entryLanguageFieldDef = function (descriptor, next) {

  callDictionaryService('languages', descriptor.token, "GET", null, function (languages) {
    fields = [];
    if (languages != null) {

      languages.forEach(function (language) {
        fields.push(
          [
            {
              "field": {
                "label": language.name + ":",
                "placeholder": language.name,
                "property": "submit." + language.id
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

      callDictionaryService('filter', descriptor.token, "POST", {section: section, key: dicKey}, function (entryData) {
        console.log(entryData)
        if (entryData == null || entryData.length !== 1) {
          descriptor.errors.push("Counld not find " + (entryData != null && entryData.length > 1)) ? "unique " : "" + "result"
          next({});
        } else {
          next(entryData[0]);
        }
      });
    }
  } else {
    next({});
  }
};

exports.dictionaryFilter = function (params, token, currentPath, next) {
  var key = params == null ? null : params.key;
  var section = params == null ? null : params.section;

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
