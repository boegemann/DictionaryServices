var express = require('express');
var router = express.Router();
var security = require("../security/jwt");

/* GET home page. */
router.post('/APP', function (req, res) {
  security.verifyToken(req.body.access_token).then(function (result) {
    console.log(result)
    var hasAccess = result === security.VALID;
    if (hasAccess) {
      res.json({
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
      });
    } else {
      res.json({
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


      });
    }
  })
});

module.exports = router;
