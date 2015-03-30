var moment = require('moment');

module.exports = {
    type: 'random',
    image: 'https://www.random.org/analysis/randbitmap-rdo-section.png',
    description: 'Generate random events, very useful for testing',
    schema: {
        interval: 500
    },
    instance: function(emit, settings) {
        var interval;
        return {
            start: function() {
                interval = setInterval(function() {
                    emit({
                        date: moment()
                                .dayOfYear(Math.random() * 365)
                                .hour(Math.random() * 24)
                                .minute(Math.random() * 60)
                                .toDate(),
                        image: 'http://lorempixel.com/400/200?r=' + Math.random(),
                        url: 'http://lorempixel.com/400/200',
                        description: 'A random image :)'
                    });
                }, settings.interval);
            },
            stop: function() {
                clearInterval(interval);
            }
        };
    }
};
