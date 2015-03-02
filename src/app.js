var reader = require('src/reader');
var app = require('exproose')({
    user: require('src/user')
});

require('src/pubsub').on('event.*', function(event) {
    console.log(event);
});

app.api.get('/readers', function(req, res) {
    res.send(reader.all());
});

app.api.get('/user/readers', function(req, res) {
    res.send(req.user.getReaders());
});

if (!module.parent) {
    app.start(function() {
        app.User.find(function(err, users) {
            users.forEach(function(user) {
                user.startReaders();
            });
        });
    });
} else {
    module.exports = app;
}
