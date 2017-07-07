var express = require('express')
var security = require ('../security/jwt')


var exports = module.exports = {}

exports.getNewState = function (hasAccess, token) {
  return hasAccess ? {
    auth: {
      isAuthenticated: true,
      errorMessage: '',
      accessToken:token,
      userId:security.getUserId(token)
    },
    app: {
      title: "Dictionary Manager",
      homeScreen: "home",
      header: {
        title: "WCG Dictionary Manager"
      },
      screens: {
        home: {
          route: "/",
          text: "Welcome Home"
        },
        other: {
          route: "/",
          text: "And now something different"
        }
      }
    }
  } : {
    auth: {
      isAuthenticated: false,
      errorMessage: ''
    },
    app: {
      title: "WCG Portal",
      homeScreen: "home",
      header: {
        title: "WCG Portal"
      },
      screens: {
        home: {
          route: "/",
          text: "Welcome Home"
        },
        other: {
          route: "/",
          text: "And now something different"
        }
      }
    }
  }
}

