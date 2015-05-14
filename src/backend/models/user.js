var mongoose = require('mongoose');

var readerSchema = new mongoose.Schema({
    type: {type: String, required: true},
    token: {type: String},
    refreshToken: {type: String},
    settings: {type: Object, default: {}},
    profile: {type: Object, default: {}}
});

var schema = new mongoose.Schema({
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    readers: [readerSchema]
});

schema.methods.isPasswordCorrect = function(password) {
    return this.password === password;
};

schema.methods.updateToken = function(reader_id, token, cb) {
    this.update({
        'readers.id': reader_id
    }, {
        $set: {
            "readers.$.token": token
        }
    }, cb);
};

module.exports = mongoose.model('User', schema);
