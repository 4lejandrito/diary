var React = require('react');

module.exports = React.createClass({
    getInitialState: function() {
        return {
            verb: this.props.verb
        };
    },
    onSubmit: function() {
        this.props.onChange({
            verb: this.state.verb
        });
    },
    onChange: function() {
        this.setState({
            verb: this.refs.verb.getDOMNode().value
        }, this.onSubmit);
    },
    render: function() {
        return <div className="verb">
            <header>
                What did {this.props.who.name} do?
            </header>
            I{' '}
            <input
                ref="verb"
                autoFocus={true}
                placeholder="verb in past tense"
                value={this.state.verb}
                onChange={this.onChange}/>
            <div><small>Examples: <i>watched, read, cooked...</i></small></div>
        </div>;
    }
});
