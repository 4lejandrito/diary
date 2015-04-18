var CronJob = require('cron').CronJob;
var rest = require('superagent');

module.exports = {
    type: 'Chuck Norris',
    image: 'http://s1.postimg.org/dhn0rp2un/9de9475b_92c7_4617_b27b_6d1025c0ff90.png',
    description: 'Get a random daily Chuck Norris joke',
    schema: {},
    instance: function(emit) {
        var dailyJob = new CronJob({
            cronTime: '00 00 08 * * 1-7',
            onTick: function() {
                rest.get('http://api.icndb.com/jokes/random?escape=javascript').end(function(err, response) {
                    if (response && response.body) {
                        emit({
                            description: response.body.value.joke
                        });
                    }
                });
            }
        });

        return {
            start: function() {
              dailyJob.start();
            },
            stop: function() {
              dailyJob.stop();
            }
        };
    }
};
