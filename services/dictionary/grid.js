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

exports.getInitialData = function (descriptor, next) {
  callDictionaryService('initialdata', descriptor, next);
};
exports.getInitialColumns = function (descriptor, next) {
  callDictionaryService('columndef', descriptor, next);
};
