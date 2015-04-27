var rest = require('superagent');

module.exports = {
    type: 'Chuck Norris',
    image: 'http://s1.postimg.org/dhn0rp2un/9de9475b_92c7_4617_b27b_6d1025c0ff90.png',
    description: 'Get a random daily Chuck Norris joke',
    schema: {},
    tick: function() {
        return new Promise(function(resolve) {
            rest
            .get('http://api.icndb.com/jokes/random?escape=javascript')
            .end(function(err, response) {
                if (response && response.body) {
                    resolve([{
                        description: response.body.value.joke
                    }]);
                } else {
                    resolve([]);
                }
            });
        });
    }
};
