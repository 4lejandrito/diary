var React = require('react');
var Icon = require('components/ui/icon');
var Event = require('components/events/event');

module.exports = React.createClass({
    onAccept: function() {
        this.props.onChange(this.props.event);
    },
    onReject: function() {
        this.props.onChange();
    },
    render: function() {
        return <div className="preview">
            <header>Are you happy with this?</header>
            <Event event={this.props.event}/>
            <button type="button" onClick={this.onAccept}>
                <Icon name="check"/> Yes
            </button>
            <button type="button" onClick={this.onReject}>
                <Icon name="close"/> No, scratch that
            </button>
        </div>;
    }
});
