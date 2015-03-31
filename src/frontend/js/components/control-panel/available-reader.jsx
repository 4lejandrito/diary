var React = require('react');
var api = require('api');
var Link = require('components/link');

module.exports = React.createClass({
    render: function() {
        return <li className="available-reader">
            <Link to="new" params={{type: this.props.reader.type}}>
                <img src={'/api/reader/' + this.props.reader.type + '/picture'}/>
                <strong>{this.props.reader.type}</strong>
                <p>{this.props.reader.description || 'No description available'}</p>
            </Link>
        </li>;
    }
});
