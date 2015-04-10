var package_json = require(process.cwd() + '/package.json');

module.exports.get = function(req, res) {
    res.send({
        version: package_json.version,
        authors: package_json.contributors
    });
};
