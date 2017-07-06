var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/APP', function (req, res, next) {
  res.json({
    App: {
      id: "Demo",
      title: "Demo App",
      homeScreen: home,
      header: {
        title: "WCG Dictionary Manager"
      },
      Screens: {
        home: {
          route: home
        }
      }
    }
  });
});

module.exports = router;
