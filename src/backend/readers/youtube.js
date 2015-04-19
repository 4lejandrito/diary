var events = require('../db').get('events');
var config = require('config');
var Youtube = require("youtube-api");

module.exports = {
    type: 'youtube',
    image: 'http://www.youtube.com/yt/brand/media/image/YouTube-icon-full_color.png',
    description: 'Tracks your Youtube watch history',
    schema: {
        oauth2: {
            authorizationURL: 'https://accounts.google.com/o/oauth2/auth',
            tokenURL: 'https://accounts.google.com/o/oauth2/token',
            clientID: config.google.clientID,
            clientSecret: config.google.clientSecret,
            scope: 'https://gdata.youtube.com'
        }
    },
    instance: function(emit) {
        var reader = this;

        return {
            start: function() {
                Youtube.authenticate({
                    type: "oauth",
                    token: reader.settings.token
                });

                setInterval(function() {
                    Youtube.channels.list({
                        part: "contentDetails",
                        mine: true,
                        maxResults: 50
                    }, function (err, data) {
                        var id = data.items[0].contentDetails.relatedPlaylists.watchHistory;
                        Youtube.playlistItems.list({
                            part: 'contentDetails,snippet',
                            playlistId: id,
                            maxResults: 50
                        }, function (err, data) {
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

            }
        };
    }
};
