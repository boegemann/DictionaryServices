var express = require('express'),
  _ = require('lodash'),
  config = require('../config'),
  jwt = require('jsonwebtoken');


var exports = module.exports = {};


const VALID = 0;
const EXPIRED = 1;
const ERROR = 2;

const ANONYMOUS = 'anonymous';

exports.VALID = VALID;
exports.EXPIRED = EXPIRED;
exports.ERROR = ERROR;

exports.ANONYMOUS = ANONYMOUS;

exports.getUserId = function(token){
  return jwt.decode(token).sub.username;
}

exports.verifyToken = function (token) {
  return new Promise(function (resolve, reject) {
    jwt.verify(token, config.secret, function (err /*, decoded */) {
      if (err) {
        console.log(err)
        resolve((err.name = 'TokenExpiredError') ? EXPIRED : ERROR);
      } else {
        resolve(VALID);
      }
    });
  });
}

