var User = module.exports = require('exproose').model('user', {
    email: { type: String, required: true, unique: true},
    date: { type: Date, default: Date.now },
    readers: { type: Object }
});
