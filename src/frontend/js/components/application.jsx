var React = require('react');
var ControlPanel = require('components/control-panel');
var api = require('api');
var Content = require('components/content');
var Loading = require('components/loading');
var Icon = require('components/icon');
var Gravatar = require('react-gravatar');
var RouteHandler = require('react-router').RouteHandler;
var Link = require('react-router').Link;
var Author = require('components/author');

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
        api.authors(function(authors) {
            self.setState({
                authors: authors
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
            <footer>
                <div>
                    <Icon name="code"/> with <Icon name="heart"/> by
                </div>
                {
                    this.state.authors.map(function(author) {
                        return <Author data={author}/>;
                    })
                }
            </footer>
        </div>;
    }
});
