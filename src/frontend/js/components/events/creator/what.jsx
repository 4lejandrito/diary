var React = require('react');

module.exports = React.createClass({
    getInitialState: function() {
        var what = this.props.what;
        var state = {};
        if (what && what.length > 0) {
            state.article = what[0].article;
            state.type = what[0].type;
        }
        return state;
    },
    onSubmit: function() {
        this.props.onChange({
            what: [{
                article: this.state.article.replace('my', 'your'),
                type: this.state.type
            }]
        });
    },
    onChange: function() {
        this.setState({
            article: this.refs.article.getDOMNode().value,
            type: this.refs.type.getDOMNode().value
        }, this.onSubmit);
    },
    render: function() {
        return <div className="what">
            <header>
                What was that {this.props.who.name} {this.props.verb}?
            </header>
            <input
                ref="article"
                className="article"
                autoFocus={true}
                placeholder="article"
                value={this.state.article}
                onChange={this.onChange}/>
            <input
                ref="type"
                placeholder="noun"
                value={this.state.type}
                onChange={this.onChange}/>
            <div>
                <small>
                    Examples: <i>a film, the match...</i>
                </small>
            </div>
        </div>;
    }
});
