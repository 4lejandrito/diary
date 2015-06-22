var github = require('octonode');
var Promise = require('promise');
var parser = require('../parsers/github');

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
        if (!reader.token) return Promise.reject('No token specified');
        var client = github.client(reader.token),
        ghuser = client.user(reader.profile.username),
        ghEvents = Promise.denodeify(ghuser.events.bind(ghuser)),
        getPage = function(page) {
            return ghEvents(page, 100).then(function(events) {
                return events.map(function(event) {
                    return {
                        date: new Date(event.created_at),
                        source_id: event.id,
                        source: event,
                        semantics: parser(reader, event)
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
