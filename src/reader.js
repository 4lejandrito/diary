var extend = require('extend');
var fs     = require('fs');
var config = require('exproose').config;
var _      = require('underscore');
var EventEmitter2 = require('eventemitter2').EventEmitter2;

var reader = module.exports = new EventEmitter2();

reader.create = function(type) {
    var readerClass = function() {
        reader.Reader.apply(this, arguments);
    };

    readerClass.prototype = Object.create(reader.Reader.prototype);
    readerClass.prototype.constructor = readerClass;
    extend(true, readerClass, reader.Reader);
    readerClass.type = type;

    return readerClass;
};

reader.all = function(type) {
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

var readersForUser = {};

reader.forUser = function(user) {
    if (!readersForUser[user._id]) {
        readersForUser[user._id] = Object.keys(user.readers || {}).map(function(key) {
            return new (reader.forType(key))(user);
        });
    }
    return readersForUser[user._id];
};

reader.add = function(type, config, user) {
    var Reader = this.forType(type);

    if (Reader) {
        user.readers[type] = config;
        var r = new Reader(user);
        this.forUser(user).push(r);
        r.start();
        return r;
    }
};

reader.start = function(user) {
    this.forUser(user).map(function(reader) {
        reader.start();
    });
};

reader.Reader = function(user) {
    this.user = user;
    this.start();
};

reader.Reader.toJSON = function() {
    return {
        type: this.type,
        schema: 'TODO'
    };
};

reader.Reader.prototype.getType = function() {
    return this.constructor.type;
};

reader.Reader.prototype.getUser = function() {
    return this.user;
};

reader.Reader.prototype.emit = function(data) {
    reader.emit('event', this.getType(), data, this.getUser());
};

reader.Reader.prototype.toJSON = function() {
    return {
        type: this.getType(),
        config: this.getUser().readers[this.getType]
    };
};

reader.Reader.prototype.start = function() {};
reader.Reader.prototype.stop = function() {};
