var github = require('octonode');
var Promise = require('promise');

module.exports = {
    type: 'github',
    image: 'http://willnielsen.com/image/1/350/0/0/secure/images/github-mark.png',
    description: 'Tracks your github commits',
    schema: {
        oauth2: {
            provider: 'github',
            strategy: require('passport-github').Strategy,
            params: {
                scope: 'repo'
            }
        }
    },
    tick: function(reader) {
        var client = github.client(reader.token),
        ghuser = client.user(reader.profile.username),
        ghEvents = Promise.denodeify(ghuser.events.bind(ghuser)),
        getPage = function(page) {
            return ghEvents(page, 100).then(function(events) {
                return events.map(function(event) {
                    return {
                        id: event.id,
                        date: new Date(event.created_at),
                        data: event
                    };
                });
            });
        };

        return Promise.all([
            getPage(1),
            getPage(2),
            getPage(3)
        ]).then(function(results) {
            return Array.prototype.concat.apply([], results);
        });
    }
};
