var mongoose = require('mongoose');

var readerSchema = new mongoose.Schema({
    type: {type: String, required: true},
    token: {type: String},
    refreshToken: {type: String},
    settings: {type: Object, default: {}},
    profile: {type: Object, default: {}}
});

var schema = new mongoose.Schema({
    readers: [readerSchema]
});

schema.plugin(require('passport-local-mongoose'), {
    usernameField: 'email'
});

schema.methods.isPasswordCorrect = function(password) {
    return this.password === password;
};

module.exports = mongoose.model('User', schema);
