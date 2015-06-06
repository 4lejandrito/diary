var React = require('react');

module.exports = React.createClass({
    getIconName: function() {
        switch(this.props.verb) {
            case undefined: return this.props.name;
            case 'watched': return "youtube-play";
            case 'added': return "plus";
            case 'created': return "plus";
            case 'deleted': return "minus";
            case 'pushed': return "upload";
            case 'published': return "cloud-upload";
            case 'shared': return "share-alt";
            case 'sent': return "send";
            default: return "lightbulb-o";
        }
    },
    render: function() {
        var className = 'icon fa ' + 'fa-' + this.getIconName();
        if (this.props.spin) className += ' fa-spin';
        return <i className={className}></i>;
    }
});
