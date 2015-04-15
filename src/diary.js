var config = require('config');
var app = require('./backend/application');

app.listen(config.port);
