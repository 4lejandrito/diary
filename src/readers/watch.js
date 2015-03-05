var watch = require('watch');

module.exports = {
    type: 'watch',
    schema: {},
    instance: function(user, emit) {
        var interval;
        return {
            start: function() {
                watch.watchTree('.', function (f, curr, prev) {
                    if (!(typeof f == "object" && prev === null && curr === null)) {
                        emit({
                            action: (prev === null) ? 'new' : (curr.nlink === 0 ? 'removed' : 'changed'),
                            file: f
                        });
                    }
                });
            },
            stop: function() {
                watch.unwatchTree('.');
            }
        };
    }
};
