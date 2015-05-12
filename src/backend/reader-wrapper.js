var extend = require('extend');
var db = require('./db');
var users = require('./db').get('users');
var oauth = require('./oauth');
var uuid = require('node-uuid');
var config = require('config');

module.exports = function(options, user, clazz) {

    var wrapper = extend(true, options, {
        state: 'stop',
        start: function() {
            getEvents();
        },
        stop: function() {
            this.state = 'stop';
            clearTimeout(timeout);
        }
    }), refreshAttempts = 3, timeout;

    function getEvents() {
        wrapper.state = 'running';
        clazz.tick(options).then(function(events) {
            console.log('promise fullfilled: ' + options.type + ', ' + events.length);
            if (wrapper.state != 'stop') {
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
                timeout = setTimeout(getEvents, clazz.interval || config.interval);
            }
            wrapper.state = 'idle';
            delete wrapper.error;
            refreshAttempts = 3;
        }).catch(onError);
    }

    function onError(error) {
        console.log('promise errored: ' + options.type + ', ' + error);
        wrapper.error = error;
        if (refreshAttempts-- > 0) {
            console.log('trying to refresh: ' + refreshAttempts);
            if (options.refreshToken) {
                console.log('trying to refresh token');
                oauth.refreshToken(options, function(err, newToken) {
                    if (err) {
                        console.log('error refreshing token: ' + err);
                        wrapper.error = err;
                        getEvents();
                    } else {
                        users.update({
                            _id: user._id,
                            'readers.id': options.id
                        }, {
                            $set: {
                                "readers.$.token": newToken
                            }
                        }).on('success', function() {
                            options.token = newToken;
                            getEvents();
                        });
                    }
                });
            } else {
                getEvents();
            }
        } else {
            wrapper.error = error;
        }
    }

    return wrapper;
};
