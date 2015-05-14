var User = require('../models/user');

module.exports = {

    get: function(req, res) {
        res.send(req.user);
    },

    create: function(req, res) {
        var email = req.body.email;
        var password = req.body.password;

        User.findOne({email: email}, function(err, user) {
            if (err) throw err;
            if (user) {
                return res.status(400).send('Existing user');
            } else {
                User.insert({email: email, password: password}, function(err, user) {
                    if (err) throw err;
                    res.send(user);
                });
            }
        });
    },

    logout: function(req, res) {
        req.logout();
        res.send('awesome');
    }
};
