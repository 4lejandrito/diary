var reader = require('src/reader');

var User = module.exports = require('exproose').model('user', {
    email: { type: String, required: true, unique: true},
    date: { type: Date, default: Date.now },
    readers: { type: Object, default: {}}
});

User._readers = {};

User.prototype.getReaders = function() {
    if (!User._readers[this._id]) {
        User._readers[this._id] = Object.keys(this.readers).map(function(key) {
            return new (reader.forType(key))(this);
        }, this);
    }
    return User._readers[this._id];
};

User.prototype.addReader = function(type, config) {
    var Reader = reader.forType(type);

    if (Reader) {
        this.readers[type] = config;
        this.getReaders().push(new Reader(this));
        return this.save();
    }
};
