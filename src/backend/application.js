var express = require('express');
var controllers = require('require-directory')(module, 'controllers');
var bodyParser = require('body-parser');
var config = require('config');
var extend = require('extend');
var readers = require('./readers');
var OAuth2Strategy  = require('passport-oauth').OAuth2Strategy;
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('./passport');
var db = require('./db');
var app = module.exports = express();

app.use(session({
    secret: config.secret,
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({url: config.db.url})
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

app.get   ('/api/user/reader'                 , controllers.user.getReaders);
app.post  ('/api/user/reader/:type'           , controllers.user.addReader);
app.delete('/api/user/reader/:id'             , controllers.user.deleteReader);
app.get   ('/api/user/event'                  , controllers.user.getEvents);
app.get   ('/api/user/event/:year'            , controllers.user.getYearView);
app.get   ('/api/user/event/:year/:month'     , controllers.user.getMonthView);
app.get   ('/api/user/event/:year/:month/:day', controllers.user.getDayView);
app.get   ('/api/reader'                      , controllers.reader.getAvailable);
app.get   ('/api/reader/:type/picture'        , controllers.reader.getPicture);

readers.all().map(function(reader) {
    if (!reader.schema.oauth2) return;
    passport.use(reader.type, new OAuth2Strategy(extend(true, reader.schema.oauth2, {
        passReqToCallback: true,
        callbackURL: config.url + '/auth/' + reader.type + '/callback'
    }), function(req, accessToken, refreshToken, profile, done) {
        controllers.user.addReaderOAuth2(req, accessToken, reader.type, done);
    }));
    app.get('/auth/' + reader.type, function(req, res) {
        passport.authenticate(reader.type, {
            state: new Buffer(JSON.stringify(req.query)).toString('base64')
        })(req, res);
    });
    app.get('/auth/' + reader.type + '/callback', passport.authenticate(reader.type, {
        successRedirect: '/#/services',
        failureRedirect: '/#/services/new'
    }));
});

db.on('open', function() {
    db.get('users').find().each(function(user) {
        readers.forUser(user).map(function(reader) {
            reader.start();
        });
    });
});
