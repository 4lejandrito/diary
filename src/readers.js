var extend = require('extend');
var fs     = require('fs');
var config = require('exproose').config;
var _      = require('underscore');
var EventEmitter2 = require('eventemitter2').EventEmitter2;

var readers = module.exports = new EventEmitter2();
var readersForUser = {};
var availableReaders = fs.readdirSync(config.readers).map(function(file) {
    return require(config.readers + '/' + file);
});

readers.all = function(type) {
    return availableReaders;
};

readers.forType = function(type) {
    return _.findWhere(this.all(), {type: type});
};

readers.forUser = function(user) {
    if (!readersForUser[user._id]) {
        readersForUser[user._id] = [];
        Object.keys(user.readers || {}).map(function(key) {
            readers.create(key, user);
        });
    }
    return readersForUser[user._id];
};

readers.forUserType = function(type, user) {
    return _.findWhere(readersForUser[user._id], {type: type});
}

readers.create = function(type, user) {
    var instance = this.forType(type).instance(user, function(data) {
        readers.emit('event', type, data, user);
    });
    var wrapper = {
        type: type,
        running: false,
        start: function() {
            this.running = true;
            instance.start();
        },
        stop: function() {
            this.running = false;
            instance.stop();
        }
    };
    readersForUser[user._id].push(wrapper);
    return wrapper;
};

readers.delete = function(type, user) {
    var reader = this.forUserType(type, user);
    reader.stop();
    var indexReader = _.findIndex(readersForUser[user._id], {type: type});
    readersForUser[user._id].splice(indexReader,1);
    return reader;
}
