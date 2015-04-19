var React = require('react');
var Icon = require('components/icon');

module.exports = React.createClass({
    render: function() {
        return <div>
            <header>
                <Icon name="youtube-play"/>{' '}
                You watched the following video
            </header>
            <iframe type="text/html"
                src={'//www.youtube.com/embed/' + this.props.event.videoId}
                frameborder="0"/>
        </div>;
    }
});
