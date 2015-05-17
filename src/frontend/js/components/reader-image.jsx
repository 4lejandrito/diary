var React = require('react');

module.exports = React.createClass({
    onClick: function(event) {
        if (this.props.onClick) {
            this.props.onClick(event, this.props.type);
        }
    },
    render: function() {
        return <img
            disabled={this.props.disabled}
            onClick={this.onClick}
            src={'/api/reader/' + this.props.type + '/picture'}
        />;
    }
});
