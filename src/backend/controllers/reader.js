var Reader = require('../models/reader');
var gravatar = require('gravatar');

module.exports = {

    getAvailable: function(req, res) {
        res.send(Reader.available());
    },

    getPicture: function(req, res) {
        if (req.params.type === 'diary') {
            res.redirect(gravatar.url(req.user.email));
        } else {
            res.redirect(Reader.forType(req.params.type).image);
        }
    },

    getReaders: function(req, res) {
        res.send(req.user.readers);
    },

    addReader: function(req, res) {
        var reader = req.user.addReader({
            type: req.params.type,
            settings: req.body
        }, function() {
            res.send(reader);
        });
    },

    addReaderOAuth2: function(req, accessToken, refreshToken, profile, type, done) {
        var state = JSON.parse(new Buffer(req.query.state, 'base64').toString('ascii'));
        req.user.addReader({
            type: type,
            token: accessToken,
            refreshToken: refreshToken,
            profile: profile,
            settings: state
        }, function() {
            done(null, req.user);
        });
    },

    deleteReader: function(req, res) {
        var reader = req.user.deleteReader(req.params.id, function() {
            res.send(reader);
        });
    }
};
