var Promise = require('promise');
var google = require('googleapis');
var parser = require('../parsers/youtube');
var async = require('async');
var extend = require('extend');

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
            access_token: reader.token
        });

        return channels({
            auth: auth,
            part: "contentDetails",
            mine: true,
            maxResults: 50
        }).then(function(data) {
            var id = data.items[0].contentDetails.relatedPlaylists.watchHistory;
            return new Promise(function (resolve, reject) {
                var videos = [], nextPageToken;
                async.doWhilst(function(cb) {
                    playListItems(extend({
                        auth: auth,
                        part: 'contentDetails,snippet',
                        playlistId: id,
                        maxResults: 50
                    }, nextPageToken && {pageToken: nextPageToken}))
                    .then(function(data) {
                        nextPageToken = data.nextPageToken;
                        videos = videos.concat(data.items);
                        cb();
                    }).catch(function(error) {
                        cb(error);
                    });
                }, function() {
                    return !!nextPageToken;
                }, function(err) {
                    if (err) reject(err); else resolve(videos);
                });
            });
        }).then(function(videos) {
            return videos.filter(function(video) {
                return video.snippet.thumbnails;
            }).map(function(video) {
                return {
                    source_id: video.id,
                    source: video,
                    date: new Date(video.snippet.publishedAt),
                    semantics: parser(reader, video)
                };
            });
        });
    }
};
