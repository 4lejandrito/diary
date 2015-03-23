var React = require('react');

module.exports = React.createClass({
    render: function() {
        return <img src={'/api/reader/' + this.props.type + '/picture'}/>;
    }
});
