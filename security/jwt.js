var express = require('express'),
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

exports.getUserId = function (token) {
  return jwt.decode(token).sub.username;
};

exports.getUser = function (token) {
  return jwt.decode(token).sub;
};


// Generate Unique Identifier for the access token
function genJti() {
  var jti = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < 16; i++) {
    jti += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return jti;
}

exports.createAccessToken = function(user) {
  return jwt.sign({
    iss: config.issuer,
    aud: config.audience,
    exp: Math.floor(Date.now() / 1000) + (60),
    scope: 'full_access',
    sub: user,
    jti: genJti(), // unique identifier for the token
    alg: 'HS256'
  }, config.secret);
}

exports.verifyToken = function (token) {
  return new Promise(function (resolve) {
    if (token === null || token === undefined) {
      resolve(ERROR);
    } else {
      jwt.verify(token, config.secret, function (err /*, decoded */) {
        if (err) {
          resolve((err.name = 'TokenExpiredError') ? EXPIRED : ERROR);
        } else {
          resolve(VALID);
        }
      });
    }
  });
};

