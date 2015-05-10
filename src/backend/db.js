var config = require('config');
var monk = require('monk');

var db = module.exports = monk(config.db.url);

db.get('events').index('reader_id source_id', {unique: true, sparse: true});
