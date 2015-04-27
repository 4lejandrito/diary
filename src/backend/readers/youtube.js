var events = require('../db').get('events');
var Youtube = require("youtube-api");
var Promise = require('promise');
var async = require('async');

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
    tick: function(reader) {
        var channels = Promise.denodeify(Youtube.channels.list),
        playListItems = Promise.denodeify(Youtube.playlistItems.list);

        Youtube.authenticate({
            type: "oauth",
            token: reader.token
        });

        return channels({
            part: "contentDetails",
            mine: true,
            maxResults: 50
        }).then(function(data) {
            var id = data.items[0].contentDetails.relatedPlaylists.watchHistory;
            return playListItems({
                part: 'contentDetails,snippet',
                playlistId: id,
                maxResults: 50
            });
        }).then(function(data) {
            return new Promise(function(resolve) {
                async.filter(data.items, function(video, ok) {
                    events.findOne({
                        reader_id: reader.id,
                        date: new Date(video.snippet.publishedAt),
                        videoId: video.contentDetails.videoId
                    }).on('success', function(existingEvent) {
                        ok(!existingEvent);
                    });
                }, resolve);
            });
        }).then(function(videos) {
            return videos.map(function(video) {
                return {
                    date: new Date(video.snippet.publishedAt),
                    description: video.snippet.title,
                    videoId: video.contentDetails.videoId
                };
            });
        });
    }
};
