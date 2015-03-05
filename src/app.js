var app = require('exproose')();
var readers = require('src/readers');

app.api.get('/reader', function(req, res) {
    res.send(readers.all());
});

app.api.get('/user/reader', function(req, res) {
    res.send(readers.forUser(req.user));
});

app.api.post('/user/reader/:type', function(req, res) {
    req.user.readers[req.params.type] = req.body;
    app.db.get('users').updateById(req.user._id, req.user)
    .on('success', function(n) {
        var reader = readers.create(req.params.type, req.user);
        reader.start();
        res.send(reader);
    });
});

app.api.get('/user/event', function(req, res) {
    app.db.get('events').find({}, '-user').on('success', function(events) {
        res.send(events);
    });
});

if (!module.parent) {
    app.start(function() {
        readers.on('event', function(type, data, user) {
            app.db.get('events').insert({
                type: type,
                user: user._id,
                data: data
            });
        });

        app.db.get('users').find().each(function(user) {
            readers.forUser(user).map(function(reader) {
                reader.start();
            });
        });
    });
} else {
    module.exports = app;
}
