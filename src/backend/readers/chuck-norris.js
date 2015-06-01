var rest = require('superagent');
var moment = require('moment');
var Promise = require('promise');
var parser = require('../parsers/chuck-norris');

module.exports = {
    type: 'Chuck Norris',
    image: 'http://s1.postimg.org/dhn0rp2un/9de9475b_92c7_4617_b27b_6d1025c0ff90.png',
    description: 'Get a random daily Chuck Norris joke',
    schema: {},
    interval: 12 * 60 * 60 * 1000,
    tick: function() {
        return new Promise(function(resolve) {
            rest
            .get('http://api.icndb.com/jokes/random?escape=javascript')
            .end(function(err, response) {
                if (response && response.body) {
                    resolve([{
                        source_id: moment().startOf('day').toString(),
                        source: response.body,
                        semantics: parser(response.body)
                    }]);
                } else {
                    resolve([]);
                }
            });
        });
    }
};
