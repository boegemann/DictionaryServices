var exports = module.exports = {};

const url = process.env.dictionaryServiceUrl;

var request = require('request');

function callDictionaryService(serviceName,next){
  request(url + serviceName, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      try {
        var result = JSON.parse(body);
        next(result);
      }catch(err){
        console.error(err);
        next (null);
      }
    }else{
      console.error(error);
      next(null);
    }
  });
}

exports.getInitialData = function (next) {
  callDictionaryService('initialdata', next);
};
exports.getInitialColumns = function (next) {
  callDictionaryService('columndef', next);
};
