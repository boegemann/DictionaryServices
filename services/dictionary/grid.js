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

exports.deleteDictionaryEntry = function (params, token, currentPath, locale, next) {
    var filter = {
        section:params.rowData.section,
        key:params.rowData.key
    }

    callDictionaryService('deleteEntry', token, "POST", filter, function (result) {


        if (result == null || result !== 1) {
            var navParams = {
                oldPath: currentPath,
                newPath: currentPath,
                locale:locale,
                data: {errorMessage: "An error occurred during the operation"}
            };
            createNavigationActions(navParams, token, next);
        } else {
            var navParams = {
                oldPath: currentPath,
                newPath: currentPath,
                locale:locale,
                data: {removed: true, message:"Item removed successfully!"}
            };
            createNavigationActions(navParams, token, next);
        }


    });
}


exports.saveDictionaryEntry = function (params, token, currentPath, locale, next) {
    var pausedPath = params.pausedPath
    delete params.pausedPath;
    callDictionaryService('saveDictionaryEntry', token, "POST", params, function (result) {


        if (result == null || result.length !== 1) {
            var navParams = {
                oldPath: currentPath,
                newPath: currentPath,
                pausedPath: pausedPath,
                locale:locale,
                data: {errorMessage: "An error occurred during the operation"}
            };
            createNavigationActions(navParams, token, next);
        } else {
            result = result[0];
            // as the key might have changed we need to recalculate the url
            var key = (result.section + "_" + result.key).replace(/\./g, '_');
            var pathArray = currentPath.split("/");
            pathArray.pop();
            var pathMinusCurrentKey = pathArray.join("/")
            var navParams = {
                oldPath: currentPath,
                newPath: pathMinusCurrentKey + "/" + key,
                pausedPath: pausedPath,
                locale:locale,
                data: {saved: true, message:"Item saved successfully!"}
            };
            createNavigationActions(navParams, token, next);
        }


    });
};

exports.addDictionaryEntry = function (params, token, currentPath, locale, next) {
    var navParams = {
        oldPath: currentPath,
        newPath: params.eventInfo.screenUrl,
        pausedPath: currentPath,
        locale:locale,
        data: null
    };
    createNavigationActions(navParams, token, next);
};

exports.showDictionaryEntry = function (params, token, currentPath, locale, next) {
    var key = (params.rowData.section + "_" + params.rowData.key).replace(/\./g, '_');
    var navParams = {
        oldPath: currentPath,
        newPath: params.eventInfo.screenUrl + "/" + key,
        pausedPath: currentPath,
        locale:locale,
        data: null
    };
    createNavigationActions(navParams, token, next);
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

            callDictionaryService('filter', descriptor.token, "POST", {
                section: section,
                key: dicKey
            }, function (entryData) {
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

exports.dictionaryFilter = function (params, token, currentPath, locale, next) {
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
        locale:locale,
        data: null
    };
    createNavigationActions(navParams, token, next);
}
