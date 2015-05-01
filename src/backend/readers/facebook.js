var rest = require('superagent');

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
    instance: function(emit) {
        var reader = this;

        function emitEvent(e) {
            if (e.object_id) {
                rest.get('https://graph.facebook.com/v2.3/' + e.object_id).query({
                    access_token: reader.token
                }).end(function(err, res) {
                    emit({
                        date: new Date(e.created_time),
                        image: JSON.parse(res.text).images[0].source,
                        description: e.message || e.caption || e.description,
                        url: e.link
                    });
                });
            } else {
                emit({
                    date: new Date(e.created_time),
                    image: e.picture,
                    description: e.message || e.caption || e.description,
                    url: e.link
                });
            }
        }

        function getFeedPage(url, query) {
            var request = rest.get(url);
            if (query) request.query(query);
            request.end(function(err, res) {
                var response = JSON.parse(res.text);
                if (response.data) {
                    response.data.map(emitEvent);
                }
                if (response.paging && response.paging.next) {
                    getFeedPage(response.paging.next);
                }
            });
        }

        return {
            start: function() {
                getFeedPage('https://graph.facebook.com/v2.3/me/feed', {
                    access_token: reader.token,
                    since: 1,
                    until: new Date().getTime()
                });
            },
            stop: function() {
            }
        };
    }
};
