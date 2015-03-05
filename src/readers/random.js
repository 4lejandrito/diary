var reader = require('src/reader');

var RandomReader = module.exports = reader.create('random');

RandomReader.prototype.start = function() {
    var self = this;
    this.interval = setInterval(function() {
        self.emit({
            value: Math.random()
        });
    }, 500);
};

RandomReader.prototype.stop = function() {
    clearInterval(this.interval);
};
