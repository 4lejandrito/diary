var React = require('react');
var Link = require('react-router').Link;

module.exports = React.createClass({
    render: function() {
        if (this.props.to) {
            return <Link {...this.props}>
                {this.props.children}
            </Link>;
        } else {
            return <a {...this.props} target="_blank">
                {this.props.children}
            </a>;
        }
    }
});
