
module.exports = function(reader, type) {
    return {
        type: type,
        running: this.running,
        start: function() {
            this.running = true;
            reader.start();
        },
        stop: function() {
            this.running = false;
            reader.stop();
        }
    }
}
