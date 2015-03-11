var readers = require('../readers');

module.exports = {
    getAvailable: function(req, res) {
        res.send(readers.all());
    }
};
