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
        return <div className="available-reader" onClick={this.addReader}>
            <img src={'/api/reader/' + this.props.reader.type + '/picture'}/>
            <strong>{this.props.reader.type}</strong>
            <p>{this.props.reader.description || 'No description available'}</p>
        </div>;
    }
});
