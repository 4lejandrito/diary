var extend = require('extend');
var db = require('./db');
var users = require('./db').get('users');
var oauth = require('./oauth');
var uuid = require('node-uuid');

module.exports = function(options, user, clazz) {

    var wrapper = extend(true, options, {
        running: false,
        start: function() {
            this.running = true;
            getEvents();
        },
        stop: function() {
            this.running = false;
            clearTimeout(timeout);
        }
    }), refreshAttempts = 3, timeout;

    function getEvents() {
        clazz.tick(options).then(function(events) {
            db.get('events').insert(events.map(function(event) {
                return extend(true, {
                    date: new Date(),
                    source_id: uuid.v4()
                }, event, {
                    type: options.type,
                    user: user._id,
                    loggedAt: new Date(),
                    reader_id: options.id
                });
            }));
            if (wrapper.running) {
                timeout = setTimeout(getEvents, options.settings.interval || 1000);
            }
            delete wrapper.error;
        }).catch(onError);
    }

    function onError(error) {
        wrapper.error = error;
        if (options.token && refreshAttempts-- > 0) {
            oauth.refreshToken(options, function(err, newToken) {
                if (err) {
                    wrapper.error = err;
                } else {
                    users.update({
                        id: user._id,
                        'readers.id': options.id
                    }, {
                        $set: {
                            "readers.$.token": newToken
                        }
                    }).on('success', function() {
                        refreshAttempts = 3;
                        options.token = newToken;
                    });
                }
            });
        } else {
            wrapper.error = error;
        }
    }

    return wrapper;
};
