var events = require('../db').get('events');
var Promise = require('promise');
var async = require('async');
var google = require('googleapis');

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
        var youtube = google.youtube('v3'),
        auth = new google.auth.OAuth2(),
        channels = Promise.denodeify(youtube.channels.list),
        playListItems = Promise.denodeify(youtube.playlistItems.list);

        auth.setCredentials({
            access_token: reader.token,
            refresh_token: reader.refreshToken
        });

        return channels({
            auth: auth,
            part: "contentDetails",
            mine: true,
            maxResults: 50
        }).then(function(data) {
            var id = data.items[0].contentDetails.relatedPlaylists.watchHistory;
            return playListItems({
                auth: auth,
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
