var React = require('react');
var eventComponents = require('./events/*', {hash: true});

module.exports = React.createClass({
    render: function() {
        var Component = eventComponents[this.props.event.type];

        return Component ? <Component event={this.props.event}/> : <div className="event">
            <header>
                {this.props.event.description || this.props.event.type}
            </header>
            {this.props.event.image ? <img src={this.props.event.image}/> : null}
        </div>;
    }
});
