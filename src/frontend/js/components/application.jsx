var React = require('react');
var ControlPanel = require('components/control-panel');
var api = require('api');
var Loading = require('components/loading');

module.exports = React.createClass({
    getInitialState: function() {
        return {};
    },
    componentWillMount: function() {
        var self = this;
        api.user(function(user) {
            self.setState({
                user: user
            });
        });
    },
    render: function() {
        return this.state.user ? <ControlPanel user={this.state.user}/> : <Loading/>;
    }
});
