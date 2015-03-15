var CronJob = require('cron').CronJob;

module.exports = {
    type: 'ChuckNorrisJokes',
    image: 'http://cdn.marketplaceimages.windowsphone.com/v8/images/9de9475b-92c7-4617-b27b-6d1025c0ff90?imageType=ws_icon_large',
    description: 'Get a random daily Chuck Norris joke',
    schema: {
    },
    instance: function(user, emit) {
        var interval;
        return {
            start: function() {
              var dailyJob = new CronJob({
                //cronTime: '0 0 8 1/1 * ? *',
                cronTime: '0 0/5 * 1/1 * ? *',
                onTick: function() {
                  emit({
                      value: this.getChuckNorrisFact()
                  });
                },
                start: false,
                timeZone: "Europe/England"
              });
              dailyJob.start();
            },
            stop: function() {
              dailyJob.stop();
            }
        };
    },
    getChuckNorrisFact: function() {
      // $.get('http://api.icndb.com/jokes/random', function(response){
      //   return response.value.joke;
      // });
      return "BLARG";
    }
};
