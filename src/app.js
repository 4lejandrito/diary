var app = require('exproose')();

app.api().route('/reader').get(function(req, res) {
    res.send(new require('src/user')({
        email: 'me@example.com',
        readers: {
            'type1': {}
        }
    }).getReaders());
});

if (!module.parent) {
    app.start();
} else {
    module.exports = app;
}
