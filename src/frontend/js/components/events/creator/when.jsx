var React = require('react');
var moment = require('moment');

module.exports = React.createClass({
    getInitialState: function() {
        return {
            hour: moment(this.props.when).hour(),
            minute: moment(this.props.when).minute()
        };
    },
    onSubmit: function() {
        this.props.onChange({
            when: moment(this.props.when)
                  .hour(this.state.hour)
                  .minute(this.state.minute)
        });
    },
    onChange: function() {
        this.setState({
            hour: this.refs.hour.getDOMNode().value,
            minute: this.refs.minute.getDOMNode().value
        }, this.onSubmit);
    },
    render: function() {
        return <div className="when">
            <header>
                What time {this.props.who.name}
                {' '}
                {this.props.verb}
                {' '}
                {this.props.what[0].article}
                {' '}
                {this.props.what[0].type}
                ?
            </header>
            <input
                autoFocus={true}
                min="0" max="23"
                type="number"
                ref="hour"
                onChange={this.onChange}
                value={this.state.hour}/>
            :
            <input
                min="0"
                max="59"
                type="number"
                ref="minute"
                onChange={this.onChange}
                value={this.state.minute}/>
            <div>
                <small>Example: <i>09:12</i></small>
            </div>
        </div>;
    }
});
