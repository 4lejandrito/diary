var readers = require('../readers');

module.exports = {

    get: function(req, res) {
        res.send(req.user);
    },

    create: function(req, res) {
        var users = req.app.db.get('users');
        var email = req.body.email;
        var password = req.body.password;

        users.findOne({email: email}, function(err, user) {
            if (err) throw err;
            if (user) {
                return res.status(400).send('Existing user');
            } else {
                users.insert({email: email, password: password}, function(err, user) {
                    if (err) throw err;
                    res.send(user);
                });
            }
        });
    },

    getReaders: function(req, res) {
        res.send(readers.forUser(req.user));
    },

    addReader: function(req, res) {
        if(!req.user.readers) req.user.readers = {};
        req.user.readers[req.params.type] = req.body;
        req.app.db.get('users').updateById(req.user._id, req.user)
        .on('success', function(n) {
            var reader = readers.create(req.params.type, req.user);
            reader.start();
            res.send(reader);
        });
    },

    deleteReader: function(req, res) {
        delete req.user.readers[req.params.type];
        req.app.db.get('users').updateById(req.user._id, req.user)
        .on('success', function(n) {
            var reader = readers.delete(req.params.type, req.user);
            res.send(reader);
        });
    },

    getEvents: function(req, res) {
        req.app.db.get('events').find({}, '-user').on('success', function(events) {
            res.send(events);
        });
    }
};
