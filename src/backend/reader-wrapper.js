var extend = require('extend');

module.exports = function(reader, instance) {
    return extend(reader, {
        running: this.running,
        start: function() {
            this.running = true;
            instance.start();
        },
        stop: function() {
            this.running = false;
            instance.stop();
        }
    });
};
