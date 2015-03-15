var React = require('react');
var ControlPanel = require('components/control-panel');
var api = require('api');
var Content = require('components/content');
var Loading = require('components/loading');
var Icon = require('components/icon');
var Gravatar = require('react-gravatar');
var RouteHandler = require('react-router').RouteHandler;
var Link = require('react-router').Link;

module.exports = React.createClass({
    getInitialState: function() {
        return {authors: []};
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
                {this.state.user ? <Link to="settings" title="Settings">
                    <Gravatar email={this.state.user.email} size={200}/>
                </Link> : false}
            </header>
            <Content>
                <RouteHandler/>
            </Content>
        </div>;
    }
});
