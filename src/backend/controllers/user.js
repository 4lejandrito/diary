var User = require('../models/user');

module.exports = {

    get: function(req, res) {
        res.send(req.user);
    },

    create: function(req, res, next) {
        User.register(new User({
            email: req.body.email
        }), req.body.password, function(err, user) {
            if (err) next(err); else res.send(user);
        });
    },

    logout: function(req, res) {
        req.logout();
        res.send('awesome');
    }
};
