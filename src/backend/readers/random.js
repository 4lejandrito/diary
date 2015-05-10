var moment = require('moment');
var Promise = require('promise');

module.exports = {
    type: 'random',
    image: 'https://www.random.org/analysis/randbitmap-rdo-section.png',
    description: 'Generate random events, very useful for testing',
    interval: 10,
    schema: {},
    tick: function() {
        return Promise.resolve([{
            date: moment()
                .subtract(Math.random() * 365, 'day')
                .toDate(),
            image: 'http://lorempixel.com/400/200?r=' + Math.random(),
            url: 'http://lorempixel.com/400/200',
            description: 'A random image :)'
        }]);
    }
};
