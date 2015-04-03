var React = require('react');
var api = require('api');
var Content = require('components/content');
var Loading = require('components/loading');
var Icon = require('components/icon');
var Gravatar = require('react-gravatar');
var RouteHandler = require('react-router').RouteHandler;
var Link = require('react-router').Link;
var Author = require('components/author');
var Logo = require('components/logo');

module.exports = React.createClass({
    getInitialState: function() {
        return {authors: [], loading: true};
    },
    componentWillMount: function() {
        var self = this;
        api.user(function(user) {
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
    render: function() {
        return <div className="app">
            <header>
                <Link to="/"><Logo/> Diary</Link>
                {this.state.user ? <Link className="face" to="/services" title="Services">
                    <Gravatar email={this.state.user.email} size={200}/>
                </Link> : false}
            </header>
            <Content>
                {this.state.loading ? <Loading/> : <RouteHandler {...this.props.params}/>}
            </Content>
            <footer>
                <div>
                    <Icon name="code"/> on <a href="http://github.com/4lejandrito/diary" target="_blank">
                        <Icon name="github-alt"/>
                    </a> by
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
