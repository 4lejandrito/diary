var readers = require('../readers');

module.exports = {
    getAvailable: function(req, res) {
        res.send(readers.all());
    },
    getPicture: function(req, res) {
        res.redirect(readers.forType(req.params.type).image);
    }
};
