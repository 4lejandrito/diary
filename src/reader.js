var pubsub = require('src/pubsub');
var extend = require('extend');
var fs     = require('fs');
var config = require('exproose').config;
var _      = require('underscore');

var reader = module.exports = function(type) {
    var readerClass = function() {
        reader.Reader.apply(this, arguments);
    };

    readerClass.prototype = Object.create(reader.Reader.prototype);
    readerClass.prototype.constructor = readerClass;
    readerClass.type = type;

    return readerClass;
};

reader.all = function() {
    if (!this._readers) {
        this._readers = fs.readdirSync(config.readers).map(function(file) {
            return require(config.readers + '/' + file);
        });
    }
    return this._readers;
};

reader.forType = function(type) {
    return _.findWhere(this.all(), {type: type});
};

reader.Reader = function(user) {
    this.user = user;
};

reader.Reader.prototype.getType = function() {
    return this.constructor.type;
};

reader.Reader.prototype.getUser = function() {
    return this.user;
};

reader.Reader.prototype.emit = function(event) {
    pubsub.emit('event.' + this.getType(), {
        event: extend(true, {}, event, {type: this.getType()}),
        user: this.getUser()
    });
};

reader.Reader.prototype.stop = function() {};
