var reader = require('src/reader');
var app = require('exproose')();

app.api.get('/reader', function(req, res) {
    res.send(reader.all());
});

app.api.get('/user/reader', function(req, res) {
    res.send(reader.forUser(req.user));
});

app.api.post('/user/reader/:type', function(req, res) {
    var r = reader.add(req.params.type, req.body, req.user);
    app.db.get('users').updateById(req.user._id, req.user).on('success', function(n) {
        res.send(r);
    });
});

app.api.get('/user/event', function(req, res) {
    app.db.get('events').find({}, '-user').on('success', function(events) {
        res.send(events);
    });
});

if (!module.parent) {
    app.start(function() {
        reader.on('event', function(type, data, user) {
            app.db.get('events').insert({
                type: type,
                user: user._id,
                data: data
            });
        });

        app.db.get('users').find().on('success', function(users) {
            users.forEach(function(user) {
                reader.start(user);
            });
        });
    });
} else {
    module.exports = app;
}
