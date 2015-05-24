var mongoose = require('mongoose');
var Reader = require('./reader');
var Event  = require('./event');

var schema = new mongoose.Schema({
    readers: [Reader.schema]
});

schema.plugin(require('passport-local-mongoose'), {
    usernameField: 'email',
    usernameLowerCase: true
});

schema.methods.start = function() {
    this.readers.map(function(r) {
        r.start();
    });
};

schema.methods.addReader = function(data, cb) {
    var reader = this.readers.create(data);
    this.readers.push(reader);
    this.save(function(err) {
        cb(err, err || reader.start());
    });
    return reader;
};

schema.methods.deleteReader = function(id, cb) {
    var reader = this.readers.id(id).remove();
    this.save(function() {
        reader.stop();
        Event.remove({reader_id: id}, function() {
            cb(reader);
        });
    });
    return reader;
};

module.exports = mongoose.model('User', schema);
