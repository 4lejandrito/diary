module.exports = function(reader, type, settings) {
    return {
        type: type,
        running: this.running,
        settings: settings,
        start: function() {
            this.running = true;
            reader.start();
        },
        stop: function() {
            this.running = false;
            reader.stop();
        }
    };
};
