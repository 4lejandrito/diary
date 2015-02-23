var reader = require('src/reader');

var User = module.exports = require('exproose').model('user', {
    email: { type: String, required: true, unique: true},
    date: { type: Date, default: Date.now },
    readers: { type: Object }
});

User.prototype.getReaders = function() {
    return Object.keys(this.readers).map(function(key) {
        return new (reader.forType(key))(this);
    }, this);
};
