var React = require('react');
var Link = require('components/ui/link');

module.exports = React.createClass({
    render: function() {
        return <li className="available-reader">
            <Link to="new" params={{type: this.props.reader.type}}>
                <h4>{this.props.reader.type}</h4>
                <p>{this.props.reader.description || 'No description available'}</p>
                <img src={'/api/reader/' + this.props.reader.type + '/picture'}/>
            </Link>
        </li>;
    }
});
