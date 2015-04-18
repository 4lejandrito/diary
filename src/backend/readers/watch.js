var watch = require('watch');

module.exports = {
    type: 'watch',
    image: 'http://blogs.mccombs.utexas.edu/the-most/files/2009/06/corrupted-excel-file.png',
    description: 'Tracks changes in the file system, also useless',
    schema: {
        directory: '.'
    },
    instance: function(emit) {
        var reader = this;
        return {
            start: function() {
                watch.watchTree(reader.settings.directory, function (f, curr, prev) {
                    if (!(typeof f == "object" && prev === null && curr === null)) {
                        emit({
                            action: (prev === null) ? 'new' : (curr.nlink === 0 ? 'removed' : 'changed'),
                            file: f
                        });
                    }
                });
            },
            stop: function() {
                watch.unwatchTree(reader.settings.directory);
            }
        };
    }
};
