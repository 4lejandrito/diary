var React = require('react');
var rest = require('superagent');
var Gravatar = require('react-gravatar');

module.exports = React.createClass({
    render: function() {
        return <a title={this.props.data.name} href={'https://github.com/' + this.props.data.github} target="_blank">
            <Gravatar email={this.props.data.email} size={200}/>
        </a>;
    }
});
