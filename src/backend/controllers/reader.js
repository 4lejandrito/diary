var readers = require('../readers');
var Event = require('../models/event');

module.exports = {

    getAvailable: function(req, res) {
        res.send(readers.all());
    },

    getPicture: function(req, res) {
        res.redirect(readers.forType(req.params.type).image);
    },

    getReaders: function(req, res) {
        res.send(readers.forUser(req.user));
    },

    addReader: function(req, res) {
        var reader = req.user.readers.create({
            type: req.params.type,
            settings: req.body
        });
        req.user.readers.push(reader);
        req.user.save(function() {
            var wrapper = readers.create(reader, req.user);
            wrapper.start();
            res.send(wrapper);
        });
    },

    addReaderOAuth2: function(req, accessToken, refreshToken, profile, type, done) {
        var state = JSON.parse(new Buffer(req.query.state, 'base64').toString('ascii'));
        var reader = req.user.readers.create({
            type: type,
            token: accessToken,
            refreshToken: refreshToken,
            profile: profile,
            settings: state
        });
        req.user.readers.push(reader);
        req.user.save(function() {
            var wrapper = readers.create(reader, req.user);
            wrapper.start();
            done(null, req.user);
        });
    },

    deleteReader: function(req, res) {
        req.user.readers.pull(req.params.id);
        req.user.save(function() {
            var deleted = readers.delete(req.user, req.params.id);
            Event.remove({reader_id: req.params.id}, function() {
                res.send(deleted);
            });
        });
    }
};
