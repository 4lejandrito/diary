var React = require('react');
var Icon = require('components/icon');

module.exports = React.createClass({
    getInitialState: function() {
        return {toggle: false};
    },
    toggle: function() {
        this.setState({toggle: !this.state.toggle});
        this.props.onChange('');
    },
    filter: function(event) {
        this.props.onChange(event.target.value);
    },
    stopPropagation: function(event) {
        event.stopPropagation();
    },
    render: function() {
        return <span className="search" onClick={this.toggle}>
            <Icon name="search"/>
            {this.state.toggle ? <input onClick={this.stopPropagation} autoFocus={true} type="text" placeholder={this.props.placeholder} onChange={this.filter}/> : false}
        </span>;
    }
});
