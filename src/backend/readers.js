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
    if (!readersForUser[user._id]) {
        readersForUser[user._id] = [];
        (user.readers || []).map(function(reader) {
            return this.create(reader, user);
        }, this);
    }
    return readersForUser[user._id];
};

readers.create = function(options, user) {
    var wrapper = readerWrapper(options, user, this.forType(options.type));
    readersForUser[user._id].push(wrapper);
    return wrapper;
};

readers.delete = function(user, id) {
    var readers = readersForUser[user._id];
    var reader = _.findWhere(readers, {id: id});
    reader.stop();
    readersForUser[user._id] = _.without(readers, reader);
    return reader;
};
