var fs     = require('fs');
var config = require('config');
var _      = require('underscore');
var readerWrapper = require('./reader-wrapper');
var EventEmitter2 = require('eventemitter2').EventEmitter2;

var readers = module.exports = new EventEmitter2();
var readersForUser = {};
var availableReaders = fs.readdirSync(config.readers).map(function(file) {
    return require(config.readers + '/' + file);
});

readers.all = function() {
    return availableReaders;
};

readers.forType = function(type) {
    return _.findWhere(this.all(), {type: type});
};

readers.forUser = function(user) {
    if (!readersForUser[user.id]) {
        readersForUser[user.id] = [];
        user.readers.map(function(reader) {
            return this.create(reader, user);
        }, this);
    }
    return readersForUser[user.id];
};

readers.create = function(options, user) {
    var wrapper = readerWrapper(options, user, this.forType(options.type));
    readersForUser[user.id].push(wrapper);
    return wrapper;
};

readers.delete = function(user, id) {
    var readers = readersForUser[user.id];
    var reader = _.find(readers, function(r) {
        return r.reader.id === id;
    });
    reader.stop();
    readersForUser[user.id] = _.without(readers, reader);
    return reader;
};
