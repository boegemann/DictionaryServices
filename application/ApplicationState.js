var express = require('express')


var exports = module.exports = {}

exports.getNewState = function (hasAccess) {
  return hasAccess ? {
    auth: {
      isAuthenticated: true,
      errorMessage: ''
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
      title: "DWCG Portal",
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

