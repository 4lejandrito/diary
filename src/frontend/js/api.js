var rest = require('superagent');
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var extend = require('extend');
var _ = require('underscore');

var api = module.exports = extend(true, new EventEmitter2(), {
    user: function(cb) {
        return rest.get('/api/user', function(res) {
            cb(res.body);
        });
    },
    availableReaders: function(cb) {
        return rest.get('/api/reader', function(res) {
            cb(res.body);
        });
    },
    activeReaders: function(cb) {
        return rest.get('/api/user/reader', function(res) {
            cb(res.body);
        });
    },
    addReader: function(type, config, cb) {
        return rest.post('/api/user/reader/' + type)
        .send(config).end(function(err, res) {
            api.emit('reader.new', res.body);
            if (cb) cb(res.body);
        });
    },
    removeReader: function(reader, cb) {
        return rest.del('/api/user/reader/' + reader.type, function(res) {
            api.emit('reader.removed', reader);
            if (cb) cb(res.body);
        });
    },
    getAvailableReader: function(type, cb) {
        return rest.get('/api/reader', function(res) {
            if (cb) cb(_.findWhere(res.body, {type: type}));
        });
    },
    authors: function(cb) {
        return rest.get('/api', function(err, res) {
            if (cb) cb(res.body.authors);
        });
    },
    events: function(cb) {
        return rest.get('/api/user/event', function(res) {
            cb(res.body);
        });
    },
    viewYear: function(year, cb) {
        return rest.get('/api/user/event/' + year, function(res) {
            cb(res.body);
        });
    },
    viewMonth: function(year, month, cb) {
        return rest.get('/api/user/event/' + year + '/' + month, function(res) {
            cb(res.body);
        });
    }
});
