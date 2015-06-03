var express = require('express');
var mongoose = require('mongoose');
var controllers = require('require-directory')(module, 'controllers');
var bodyParser = require('body-parser');
var config = require('config');
var Reader = require('./models/reader');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('./passport');
var User = require('./models/user');
var app = module.exports = express();
var oauth = require('./oauth');

mongoose.connect(config.db.url);

app.use(session({
    secret: config.secret,
    resave: true,
    saveUninitialized: true,
    rolling: true,
    store: new MongoStore({url: config.db.url}),
    cookie: {maxAge: 31*24*60*60*1000, httpOnly: true}
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

app.get ('/api'            , controllers.info.get);
app.post('/api/user'       , controllers.user.create);
app.use ('/api/*'          , passport.authenticate('diary'));
app.get ('/api/user'       , controllers.user.get);
app.post('/api/user/logout', controllers.user.logout);
app.use ('/auth/*'         , passport.authenticate('diary'));
app.use ('/'               , express.static('src/public'));

app.get   ('/api/user/reader'                 , controllers.reader.getReaders);
app.post  ('/api/user/reader/:type'           , controllers.reader.addReader);
app.delete('/api/user/reader/:id'             , controllers.reader.deleteReader);
app.get   ('/api/user/event'                  , controllers.event.getEvents);
app.post  ('/api/user/event'                  , controllers.event.newEvent);
app.get   ('/api/user/event/:year/:month?'    , controllers.event.getEventsView);
app.get   ('/api/user/event/:year/:month/:day', controllers.event.getEvents);
app.get   ('/api/user/semantics/:year?/:month?/:day?', controllers.event.getOverview);
app.get   ('/api/reader'                      , controllers.reader.getAvailable);
app.get   ('/api/reader/:type/picture'        , controllers.reader.getPicture);

Reader.available().map(function(reader) {
    if (reader.schema.oauth2) {
        oauth.register(app, reader, controllers.reader.addReaderOAuth2);
    }
});

User.find().stream().on('data', function(user) {
    user.start();
});
