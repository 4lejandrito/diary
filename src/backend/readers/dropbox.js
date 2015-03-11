var Dropbox = require('dropbox');

module.exports = {
    type: 'dropbox',
    schema: {},
    instance: function(user, emit) {
        return {
            start: function() {
            },
            stop: function() {
            }
        };
    }
};
