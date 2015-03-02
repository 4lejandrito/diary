var reader = require('src/reader');

module.exports = function(schema, options) {
    schema.add({
        readers: {type: Object, minimize: false, default: {}}
    });

    var readers = {};

    schema.methods.getReaders = function() {
        if (!readers[this._id]) {
            readers[this._id] = Object.keys(this.readers).map(function(key) {
                return new (reader.forType(key))(this);
            }, this);
        }
        return readers[this._id];
    };

    schema.methods.addReader = function(type, config) {
        var Reader = reader.forType(type);

        if (Reader) {
            this.set('readers.' + type, config);
            var r = new Reader(this);
            this.getReaders().push(r);
            this.save(function(err, user, number) {
                r.start();
            });
        }
    };

    schema.methods.startReaders = function() {
        this.getReaders().map(function(reader) {
            reader.start();
        });
    };
};
