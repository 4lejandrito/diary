var github = require('octonode');
var db = require('../db');
var config = require('config');

module.exports = {
    type: 'github',
    image: 'http://willnielsen.com/image/1/350/0/0/secure/images/github-mark.png',
    description: 'Tracks your github commits',
    schema: {
        oauth2: {
            authorizationURL: 'https://github.com/login/oauth/authorize',
            tokenURL: 'https://github.com/login/oauth/access_token',
            clientID: config.github.clientID,
            clientSecret: config.github.clientSecret,
            scope: 'repo'
        }
    },
    instance: function(emit, reader) {
        var interval;
        return {
            start: function() {
                var client = github.client(reader.settings.token);
                client.me().info(function(err, info) {
                    var ghuser = client.user(info.login);
                    interval = setInterval(function() {
                        function processEvents(err, data) {
                            if (data) {
                                data.map(function(event) {
                                    if (event.type === 'PushEvent') {
                                        db.get('events').findOne({
                                            reader_id: reader.id,
                                            'data.id': event.id
                                        }).on('success', function (lastMessage) {
                                            if (!lastMessage) {
                                                emit({
                                                    date: new Date(event.created_at),
                                                    data: event
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        }
                        ghuser.events(1, 100, processEvents);
                        ghuser.events(2, 100, processEvents);
                        ghuser.events(3, 100, processEvents);
                    }, 60000);
                });
            },
            stop: function() {
                clearInterval(interval);
            }
        };
    }
};
