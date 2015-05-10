var rest = require('superagent');
var Promise = require('promise');
var async = require('async');

module.exports = {
    type: 'facebook',
    image: 'http://www.h3dwallpapers.com/wp-content/uploads/2014/11/Facebook_logo_png-5.png',
    description: 'Tracks your Facebook account',
    schema: {
        oauth2: {
            provider: 'facebook',
            strategy: require('passport-facebook').Strategy,
            params: {
                scope: ['user_about_me', 'user_posts', 'user_photos', 'email', 'read_mailbox'],
                profileFields: ['id', 'displayName', 'photos', 'email']
            }
        }
    },
    tick: function(reader) {
        return new Promise(function (resolve, reject) {
            var events = [],
                lastResponse = {},
                url = 'https://graph.facebook.com/v2.3/me/feed?access_token=' + reader.token +
                '&since=1&until=' + new Date().getTime();

            async.doWhilst(function(cb) {
                rest.get(url).end(function(err, res) {
                    try {
                        lastResponse = JSON.parse(res.text);
                        if (lastResponse.data) {
                            lastResponse.data.map(function(e) {
                                events.push(e);
                            });
                        }
                    } catch (error) {
                        return cb(error);
                    }
                    cb(err);
                });
            }, function() {
                return (url = lastResponse.paging && lastResponse.paging.next);
            }, function(err) {
                if (err) reject(err); else resolve(events);
            });
        }).then(function(events) {
            return events.map(function(e) {
                return {
                    date: new Date(e.created_time),
                    source_id: e.id,
                    source: e,
                    image: e.picture,
                    description: e.message || e.caption || e.description,
                    url: e.link
                };
            });
        });
    }
};
