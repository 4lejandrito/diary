var React = require('react');
var api = require('api');
var Icon = require('components/icon');

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
            <p><strong>Status</strong>: {this.props.reader.running ? 'running' : 'stop'}</p>
            <button onClick={this.remove}><Icon name="close"/></button>
        </div>;
    }
});
