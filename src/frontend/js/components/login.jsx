var React = require('react');
var api = require('api');
var Sticky = require('react-sticky');
var Icon = require('components/icon');

var Error = React.createClass({
    render: function() {
        return <div className="error">
            <Icon name="warning"/> {this.props.error}
        </div>;
    }
});

var Input = React.createClass({
    render: function() {
        return <div className="input-group">
            <Icon name={this.props.icon}/> {this.props.error}
            <input ref="input" {...this.props}/>
        </div>;
    },
    getValue: function() {
        return this.refs.input.getDOMNode().value;
    }
});

module.exports = React.createClass({
    getInitialState: function() {
        return {};
    },
    login: function(event) {
        event.preventDefault();
        api.auth(
            this.refs.username.getValue(),
            this.refs.password.getValue(),
            this.onLogin
        );
    },
    onLogin: function(err, user) {
        if (err) {
            this.setState({
                error: err
            });
        } else {
            this.props.onLogin(user);
        }
    },
    render: function() {
        return <article className="login">
            <Sticky type={React.DOM.header}>
                <h2>
                    Login
                </h2>
                <h3>Access your diary</h3>
            </Sticky>
            <form onSubmit={this.login}>
                {this.state.error && <Error error="Invalid credentials"/>}
                <Input autoFocus placeholder="Username" icon="user" ref="username" type="email"/>
                <Input placeholder="Password" icon="key" ref="password" type="password"/>
                <button onClick={this.login}>Login <Icon name="sign-in"/></button>
            </form>
        </article>;
    }
});
