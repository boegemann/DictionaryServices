var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sassMiddleware = require('node-sass-middleware');
var i18n = require("i18next");
var Backend = require('i18next-node-fs-backend');

var app = express();

var index = require('./routes/index');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true, // true = .sass and false = .scss
    sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


app.use(index);

app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

i18n.use(Backend).init({
    fallbackLng:'en',
    preload:['en','de'],
    backend: {
        loadPath: 'locales/{{lng}}/{{ns}}.json'
    },
    debug: true //,
    // resources: {
    //     en: {
    //         translation: {
    //             "key": "hello world"
    //         }
    //     },
    //     de: {
    //         translation: {
    //             "key": "Hallo Welt"
    //         }
    //     }
    // }
});


module.exports = app;
