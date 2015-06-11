var React = require('React');

module.exports = React.createClass({
    onSubmit: function(event) {
        event.preventDefault();
        this.props.onSubmit(event);
    },
    render: function() {
        return <form {...this.props} onSubmit={this.onSubmit}>
            {this.props.children}
        </form>;
    }
});
