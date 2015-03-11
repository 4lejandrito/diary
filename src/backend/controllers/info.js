var config = require('config');

var version = require(process.cwd() + '/package.json').version;

module.exports.get = function(req, res) {
    res.send({
        version: version
    });
};
