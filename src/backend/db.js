var config = require('config');
var monk = require('monk');

module.exports = monk(config.db.url);
