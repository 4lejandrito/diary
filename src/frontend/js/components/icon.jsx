var React = require('react');

module.exports = React.createClass({
    render: function() {
        var className = 'icon fa ' + 'fa-' + this.props.name;
        if (this.props.spin) className += ' fa-spin';
        return <i className={className}></i>;
    }
});
