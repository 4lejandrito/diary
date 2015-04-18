var extend = require('extend');
var events = require('./db').get('events');

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

    var instance = clazz.instance.apply(options, [onEvent, onError]),
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
