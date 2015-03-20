var moment = require('moment');

module.exports = {
    type: 'random',
    image: 'https://www.random.org/analysis/randbitmap-rdo-section.png',
    description: 'Tracks random events, pretty useless',
    schema: {
        interval: 500
    },
    instance: function(user, emit) {
        var interval;
        return {
            start: function() {
                interval = setInterval(function() {
                    emit({
                        date: moment().dayOfYear(Math.random() * 365).toDate(),
                        value: Math.random()
                    });
                }, user.readers.random.interval);
            },
            stop: function() {
                clearInterval(interval);
            }
        };
    }
};
