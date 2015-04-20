var extend = require('extend');
var events = require('./db').get('events');
var users = require('./db').get('users');
var oauth = require('./oauth');

module.exports = function(options, user, clazz) {

    function onEvent(event) {
        events.insert(extend(true, {
            date: new Date()
        }, event, {
            type: options.type,
            user: user._id,
            loggedAt: new Date(),
            reader_id: options.id
        }));
        delete wrapper.error;
    }

    function onError(err) {
        wrapper.error = err;
    }

    var refreshAttempts = 3;
    function refresh() {
        if (refreshAttempts-- > 0) {
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
                        instance.stop();
                        instance.start();
                    });
                }
            });
        }
    }

    var instance = clazz.instance.apply(options, [onEvent, onError, refresh]),
        wrapper = extend(true, options, {
            running: false,
            start: function() {
                this.running = true;
                instance.start();
            },
            stop: function() {
                this.running = false;
                instance.stop();
            }
        });

    return wrapper;
};
