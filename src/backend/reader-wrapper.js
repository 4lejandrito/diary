var extend = require('extend');
var oauth = require('./oauth');
var config = require('config');
var Event = require('./models/event');

module.exports = function(options, user, clazz) {

    var wrapper = extend({
        state: 'stop',
        reader: options,
        start: function() {
            getEvents();
        },
        stop: function() {
            this.state = 'stop';
            clearTimeout(timeout);
        },
        toJSON: function() {
            return extend(true, {}, options.toObject(), {
                state: this.state,
                error: this.error
            });
        }
    }), refreshAttempts = 3, timeout;

    function getEvents() {
        wrapper.state = 'running';
        clazz.tick(options).then(function(events) {
            if (wrapper.state != 'stop') {
                Event.insert(events.map(function(event) {
                    return extend(event, {
                        type: options.type,
                        user: user.id,
                        reader_id: options.id
                    });
                }), function(created) {
                    console.log(
                        '%s events: %d/%d',
                        options.type,
                        created.length,
                        events.length
                    );
                });
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
                        user.updateToken(options.id, newToken, function(err) {
                            return err ? onError(err) : getEvents();
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
