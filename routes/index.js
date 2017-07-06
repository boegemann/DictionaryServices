var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/APP', function (req, res, next) {
  res.json({
    app: {
      id: "DicMan",
      title: "Dictionary Manager",
      homeScreen: "home",
      header: {
        title: "WCG Dictionary Manager"
      },
      screens: {
        home: {
          route: "/",
          text:"Welcom Home"
        },
        other: {
          route: "/",
          text:"And now something different"
        }
      }
    }
  });
});

module.exports = router;
