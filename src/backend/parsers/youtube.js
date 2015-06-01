module.exports = function(reader, video) {
    var pictures = video.snippet.thumbnails;
    var picture = pictures.medium || pictures.standard || pictures.default || pictures.high;
    return {
        verb: 'watched',
        what: [{
            type: 'video',
            title: video.snippet.title,
            picture: picture.url,
            url: '//www.youtube.com/watch?v=' + video.contentDetails.videoId
        }],
        who: {
            name: reader.profile.displayName,
            url: reader.profile._json.url,
            isYou: true
        },
        when: new Date(video.snippet.publishedAt)
    };
};
