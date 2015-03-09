
module.exports = function(reader, type) {
    var self = this;
    self.type = type;
    self.running = false;
    self.reader = reader;

    this.start = function() {
        self.running = true;
        self.reader.start();
    },
    this.stop = function() {
        self.running = false;
        self.reader.stop();
    }
}
