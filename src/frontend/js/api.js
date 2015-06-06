var rest = require('superagent');
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var extend = require('extend');
var _ = require('underscore');

var response = function(cb) {
    return function(err, res) {
        cb(err, res && res.body);
    };
};

var api = module.exports = extend(true, new EventEmitter2(), {
    auth: function(username, password, cb) {
        return rest.get('/api/user').query({
            username: username,
            password: password
        }).end(response(cb));
    },
    logout: function(cb) {
        return rest.post('/api/user/logout').end(response(cb));
    },
    user: function(cb) {
        return rest.get('/api/user').end(response(cb));
    },
    availableReaders: function(cb) {
        return rest.get('/api/reader').end(response(cb));
    },
    activeReaders: function(cb) {
        return rest.get('/api/user/reader').end(response(cb));
    },
    addReader: function(type, config, cb) {
        return rest.post('/api/user/reader/' + type)
        .send(config).end(function(err, res) {
            api.emit('reader.new', res.body);
            if (cb) cb(res.body);
        });
    },
    removeReader: function(reader, cb) {
        return rest.del('/api/user/reader/' + reader._id).end(function(err, res) {
            api.emit('reader.removed', reader);
            if (cb) cb(err, res.body);
        });
    },
    getAvailableReader: function(type, cb) {
        return rest.get('/api/reader').end(function(err, res) {
            if (cb) cb(err, _.findWhere(res.body, {type: type}));
        });
    },
    authors: function(cb) {
        return rest.get('/api', function(err, res) {
            if (cb) cb(res.body.authors);
        });
    },
    events: function(query, cb) {
        return rest.get('/api/user/event').query(query).end(response(cb));
    },
    viewYear: function(year, cb) {
        return rest.get('/api/user/event/' + year).end(response(cb));
    },
    viewMonth: function(year, month, cb) {
        return rest.get('/api/user/event/' + year + '/' + month, response(cb));
    },
    viewDay: function(year, month, day, cb) {
        return rest.get('/api/user/event/' + year + '/' + month + '/' + day, response(cb));
    },
    createEvent: function(event, cb) {
        return rest.post('/api/user/event')
        .send(event).end(response(cb));
    }
});
