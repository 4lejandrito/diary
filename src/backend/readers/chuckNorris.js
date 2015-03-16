var CronJob = require('cron').CronJob;
var rest = require('superagent');

module.exports = {
    type: 'Chuck Norris Jokes',
    image: 'http://cdn.marketplaceimages.windowsphone.com/v8/images/9de9475b-92c7-4617-b27b-6d1025c0ff90?imageType=ws_icon_large',
    description: 'Get a random daily Chuck Norris joke',
    schema: {
    },
    getChuckNorrisFact: function() {

    },
    instance: function(user, emit) {
        var interval, dailyJob = new CronJob({
          cronTime: '00 00 08 * * 1-7',
          onTick: function() {
            rest.get('http://api.icndb.com/jokes/random', function(response){
              emit({
                  value: response.body.value.joke
              });
            });
          },
          start: false
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
