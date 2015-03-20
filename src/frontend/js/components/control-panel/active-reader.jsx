var React = require('react');
var api = require('api');
var Icon = require('components/icon');
var _ = require('underscore');

module.exports = React.createClass({
    getInitialState: function() {
        return {disabled: false};
    },
    remove: function() {
        api.removeReader(this.props.reader);
        this.setState({disabled: true});
    },
    render: function() {
        return <div className="active-reader">
            <img src={'/api/reader/' + this.props.reader.type + '/picture'}/>
            <strong>{this.props.reader.type}</strong>
            {
                _.mapObject(this.props.reader.settings, function(value, key) {
                    return <p><strong>{key}</strong>: {value}</p>;
                })
            }
            <button onClick={this.remove}><Icon name="close"/></button>
        </div>;
    }
});
