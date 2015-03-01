var app = require('exproose')();

if (!module.parent) {
    app.start();
} else {
    module.exports = app;
}
