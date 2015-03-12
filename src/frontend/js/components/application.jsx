var React = require('react');
var ControlPanel = require('components/control-panel');
var api = require('api');
var Loading = require('components/loading');
var Icon = require('components/icon');
var Gravatar = require('react-gravatar');

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
        return <div className="app">
            <header>
                <Icon name="pencil"/> Diary
                {this.state.user ? <Gravatar email={this.state.user.email} size={200}/> : false}
            </header>
            {this.state.user ? <ControlPanel user={this.state.user}/> : <Loading/>}
        </div>;
    }
});
