var events = require('../db').get('events');
var Youtube = require("youtube-api");

module.exports = {
    type: 'youtube',
    image: 'http://www.youtube.com/yt/brand/media/image/YouTube-icon-full_color.png',
    description: 'Tracks your Youtube watch history',
    schema: {
        oauth2: {
            provider: 'google',
            strategy: require('passport-google-oauth').OAuth2Strategy,
            params: {
                scope: ['https://gdata.youtube.com', 'profile']
            },
            authParams: {
                approvalPrompt: 'force',
                accessType: 'offline'
            }
        }
    },
    instance: function(emit, error, refresh) {
        var reader = this, interval;

        return {
            start: function() {
                Youtube.authenticate({
                    type: "oauth",
                    token: reader.token
                });

                interval = setInterval(function() {
                    Youtube.channels.list({
                        part: "contentDetails",
                        mine: true,
                        maxResults: 50
                    }, function (err, data) {
                        if (err) return refresh();
                        var id = data.items[0].contentDetails.relatedPlaylists.watchHistory;
                        Youtube.playlistItems.list({
                            part: 'contentDetails,snippet',
                            playlistId: id,
                            maxResults: 50
                        }, function (err, data) {
                            if (err) return refresh();
                            data.items.map(function(item) {
                                events.findOne({
                                    reader_id: reader.id,
                                    date: new Date(item.snippet.publishedAt),
                                    videoId: item.contentDetails.videoId
                                }).on('success', function(event) {
                                    if (!event) {
                                        emit({
                                            date: new Date(item.snippet.publishedAt),
                                            description: item.snippet.title,
                                            videoId: item.contentDetails.videoId,
                                            image: item.snippet.thumbnails.high.url
                                        });
                                    }
                                });
                            });
                        });
                    });
                }, 60000);
            },
            stop: function() {
                clearInterval(interval);
            }
        };
    }
};
