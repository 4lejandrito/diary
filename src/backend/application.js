var express = require('express');
var controllers = require('require-directory')(module, 'controllers');
var auth = require('./passport');
var monk = require('monk');
var bodyParser = require('body-parser');
var config = require('config');
var extend = require('extend');
var readers = require('./readers');

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
    app.use ('/'        , express.static('src/public'));

    app.get   ('/api/user/reader'         , controllers.user.getReaders);
    app.post  ('/api/user/reader/:type'   , controllers.user.addReader);
    app.delete('/api/user/reader/:type'   , controllers.user.deleteReader);
    app.get   ('/api/user/event'          , controllers.user.getEvents);
    app.get   ('/api/reader'              , controllers.reader.getAvailable);
    app.get   ('/api/reader/:type/picture', controllers.reader.getPicture);

    app.db = monk(config.db.url);

    app.db.on('open', function() {
        readers.on('event', function(type, data, user) {
            app.db.get('events').insert({
                type: type,
                user: user._id,
                data: data
            });
        });

        app.db.get('users').find().each(function(user) {
            readers.forUser(user).map(function(reader) {
                reader.start();
            });
        });
    });

    return app;
};
