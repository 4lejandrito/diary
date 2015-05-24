var Facebook = require('../util/facebook');

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
        var fb = new Facebook({
            access_token: reader.token,
            since: reader.lastEvent / 1000 | 0,
        });

        return fb.getEdges('me/feed').then(function(posts) {
            return posts.map(function(p) {
                return {
                    date: new Date(p.created_time),
                    source_id: p.id,
                    source: p,
                    image: p.picture,
                    description: p.message || p.caption || p.description,
                    url: p.link
                };
            });
        });
    }
};
