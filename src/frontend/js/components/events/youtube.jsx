var React = require('react');
var Icon = require('components/icon');
var Link = require('components/link');

module.exports = React.createClass({
    render: function() {
        var video = this.props.event.source;
        var pictures = video.snippet.thumbnails;
        var picture = pictures.medium || pictures.standard || pictures.default || pictures.high;
        return <div className="event">
            <header>
                <Icon name="youtube-play"/>{' '}
                You watched the following video
            </header>
            <small>{this.props.event.description}</small>
            <div className="video">
                <img src={picture.url}/>
                <Link href={'//www.youtube.com/watch?v=' + video.contentDetails.videoId} className="play">
                    <Icon name="youtube-play"/>
                </Link>
            </div>
        </div>;
    }
});
