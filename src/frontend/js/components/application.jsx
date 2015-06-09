var React = require('react');
var api = require('api');
var Content = require('components/content');
var Loading = require('components/loading');
var Gravatar = require('react-gravatar');
var RouteHandler = require('react-router').RouteHandler;
var Link = require('react-router').Link;
var Logo = require('components/logo');
var Login = require('components/login');

module.exports = React.createClass({
    getInitialState: function() {
        return {authors: [], loading: true};
    },
    componentWillMount: function() {
        var self = this;
        api.user(function(err, user) {
            self.setState({
                user: user,
                loading: false
            });
        });
        api.authors(function(authors) {
            self.setState({
                authors: authors
            });
        });
    },
    login: function(user) {
        this.setState({
            user: user
        });
    },
    logout: function() {
        var self = this;
        api.logout(function() {
            self.setState({
                user: undefined
            });
        });
    },
    render: function() {
        return <div className="app">
            <header>
                <h1><Link to="/"><Logo/> Diary</Link></h1>
                {this.state.user ? <Link className="face" to="/services" title="Services">
                    <span className="username">{this.state.user.email} </span>
                    <Gravatar email={this.state.user.email} size={200}/>
                </Link> : false}
            </header>
            <Content>
                {this.state.loading && <Loading/>}
                {this.state.user && <RouteHandler {...this.props.params}/>}
                {!this.state.user && !this.state.loading && <Login onLogin={this.login}/>}
            </Content>
        </div>;
    }
});
