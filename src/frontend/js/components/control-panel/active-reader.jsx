var React = require('react');
var api = require('api');
var Icon = require('components/icon');
var _ = require('underscore');
var Link = require('components/link');

module.exports = React.createClass({
    getInitialState: function() {
        return {disabled: false};
    },
    remove: function(event) {
        event.stopPropagation();
        event.preventDefault();
        api.removeReader(this.props.reader);
        this.setState({disabled: true});
    },
    render: function() {
        var className = '';
        if (this.props.reader.error) {
            className += 'error';
        }
        return <li className="active-reader">
            <Link className={className} to="new" params={{type: this.props.reader.type}}>
                <h4>{this.props.reader.type}</h4>
                <img src={'/api/reader/' + this.props.reader.type + '/picture'}/>
                <button className="danger" onClick={this.remove}>
                    <Icon name="close"/> Remove
                </button>
            </Link>
        </li>;
    }
});
