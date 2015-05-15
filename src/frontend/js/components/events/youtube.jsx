var React = require('react');
var Icon = require('components/icon');

module.exports = React.createClass({
    render: function() {
        var video = this.props.event.source;
        return <div>
            <header>
                <Icon name="youtube-play"/>{' '}
                You watched the following video
            </header>
            <iframe type="text/html"
                src={'//www.youtube.com/embed/' + video.contentDetails.videoId}
                frameBorder="0"/>
        </div>;
    }
});
