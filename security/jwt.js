var express = require('express'),
  config = require('../config'),
  jwt = require('jsonwebtoken');


var exports = module.exports = {};

const jwtSecret = process.env.jwtSecret;
const EXPIRY_IN_MINUTES = 10;



exports.getUserId = function (token) {
  return jwt.decode(token).sub.username;
};

exports.getUser = function (token) {
  if (token==null)return null;
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

const createAccessToken = function (user) {
  return jwt.sign({
    iss: config.issuer,
    aud: config.audience,
    exp: Math.floor(Date.now() / 1000) + (EXPIRY_IN_MINUTES * 60),
    scope: 'full_access',
    sub: user,
    // jti: genJti(), // unique identifier for the token
    alg: 'HS256'
  }, jwtSecret);
};

exports.createAccessToken = createAccessToken;

exports.verifyAndTouch = function (token) {
  if (token == null)return null;
  try {
    var decoded = jwt.verify(token, jwtSecret);
    var user = decoded.sub;
    return createAccessToken(user);
  } catch (err) {
    console.error(err);
    return null;
  }
};

