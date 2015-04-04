var React = require('react');
var api = require('api');
var Icon = require('components/icon');
var _ = require('underscore');
var Link = require('components/link');

module.exports = React.createClass({
    getInitialState: function() {
        return {disabled: false};
    },
    remove: function() {
        api.removeReader(this.props.reader);
        this.setState({disabled: true});
    },
    render: function() {
        return <li className="active-reader">
            <Link to="new" params={{type: this.props.reader.type}}>
                <h4>{this.props.reader.type}</h4>
                <img src={'/api/reader/' + this.props.reader.type + '/picture'}/>
                {
                    _.mapObject(this.props.reader.settings, function(value, key) {
                        return <p><strong>{key}</strong>: {value}</p>;
                    })
                }
            </Link>
            <button onClick={this.remove}><Icon name="close"/></button>
        </li>;
    }
});
