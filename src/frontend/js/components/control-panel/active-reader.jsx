var React = require('react');
var api = require('api');

module.exports = React.createClass({
    getInitialState: function() {
        return {disabled: false};
    },
    remove: function() {
        api.removeReader(this.props.reader);
        this.setState({disabled: true});
    },
    render: function() {
        return <div>
            {this.props.reader.type} - {this.props.reader.running}
            <button disabled={this.state.disabled} onClick={this.remove}>Delete</button>
        </div>;
    }
});
