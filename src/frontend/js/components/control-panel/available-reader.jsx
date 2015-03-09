var React = require('react');
var api = require('api');

module.exports = React.createClass({
    addReader: function() {
        api.addReader(
            this.props.reader.type,
            {}
        );
    },
    render: function() {
        return <a href="#" onClick={this.addReader}>{this.props.reader.type}</a>;
    }
});
