var React = require('react');
var api = require('api');
var Link = require('react-router').Link;

module.exports = React.createClass({
    render: function() {
        return <Link to="new" params={{type: this.props.reader.type}} className="available-reader">
            <img src={'/api/reader/' + this.props.reader.type + '/picture'}/>
            <strong>{this.props.reader.type}</strong>
            <p>{this.props.reader.description || 'No description available'}</p>
        </Link>;
    }
});
