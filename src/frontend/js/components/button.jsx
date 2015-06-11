var React = require('react');
var Icon = require('components/icon');
var Loading = require('components/loading');

module.exports = React.createClass({
    render: function() {
        return <button {...this.props} disabled={this.props.loading}>
            {this.props.loading && <Loading/>}
            {this.props.icon && !this.props.loading && <Icon name={this.props.icon}/>}
            {' '}
            {this.props.children}
        </button>;
    }
});
