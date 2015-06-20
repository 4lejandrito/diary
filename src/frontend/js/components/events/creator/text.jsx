var React = require('react');

module.exports = React.createClass({
    getInitialState: function() {
        return {
            text: this.props.text
        };
    },
    onSubmit: function() {
        this.props.onChange({
            text: this.state.text
        });
    },
    onChange: function() {
        this.setState({
            text: this.refs.text.getDOMNode().value
        }, this.onSubmit);
    },
    render: function() {
        return <div className="text">
            <header>
                Do you want to add some free text?
            </header>
            <textarea
                ref="text"
                autoFocus={true}
                placeholder="Describe carefully"
                value={this.state.text}
                onChange={this.onChange}/>
            <div><small>Examples: <i>watched, read, cooked...</i></small></div>
        </div>;
    }
});
