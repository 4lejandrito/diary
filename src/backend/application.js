var express = require('express');
var controllers = require('require-directory')(module, 'controllers');
var auth = require('./passport');
var monk = require('monk');
var bodyParser = require('body-parser');
var config = require('config');
var extend = require('extend');
var readers = require('./readers');
var OAuth2Strategy  = require('passport-oauth').OAuth2Strategy;

var Application = module.exports = function() {
    var app = express();

    var passport = auth(app);

    app.use(passport.initialize());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());

    app.get ('/api'     , controllers.info.get);
    app.post('/api/user', controllers.user.create);
    app.use ('/api/*'   , passport.authenticate('basic'));
    app.get ('/api/user', controllers.user.get);
    app.use ('/auth/*'  , passport.authenticate('basic'));
    app.use ('/'        , express.static('src/public'));

    app.get   ('/api/user/reader'                 , controllers.user.getReaders);
    app.post  ('/api/user/reader/:type'           , controllers.user.addReader);
    app.delete('/api/user/reader/:id'             , controllers.user.deleteReader);
    app.get   ('/api/user/event'                  , controllers.user.getEvents);
    app.get   ('/api/user/event/:year'            , controllers.user.getYearView);
    app.get   ('/api/user/event/:year/:month'     , controllers.user.getMonthView);
    app.get   ('/api/user/event/:year/:month/:day', controllers.user.getDayView);
    app.get   ('/api/reader'                      , controllers.reader.getAvailable);
    app.get   ('/api/reader/:type/picture'        , controllers.reader.getPicture);

    app.db = monk(config.db.url);

    readers.all().map(function(reader) {
        if (!reader.schema.oauth2) return;
        passport.use(reader.type, new OAuth2Strategy(extend(true, reader.schema.oauth2, {
            passReqToCallback: true
        }), function(req, accessToken, refreshToken, profile, done) {
            controllers.user.addReaderOAuth2(req, accessToken, reader.type, done);
        }));
        app.get('/auth/' + reader.type, passport.authenticate(reader.type));
        app.get('/auth/' + reader.type + '/callback', passport.authenticate(reader.type, {
            successRedirect: '/#/services',
            failureRedirect: '/#/services/new'
        }));
    });

    app.db.on('open', function() {
        readers.on('event', function(event) {
            app.db.get('events').insert(event);
        });

        app.db.get('users').find().each(function(user) {
            readers.forUser(user).map(function(reader) {
                reader.start();
            });
        });
    });

    return app;
};
