var app = require('exproose')();

app.api().route('/reader').get(function(req, res) {
    res.send(require('src/reader').all().map(function(reader) {
        return reader.type;
    }));
});

if (!module.parent) {
    app.start();
} else {
    module.exports = app;
}
