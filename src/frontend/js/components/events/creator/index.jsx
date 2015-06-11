var React = require('react');
var Icon = require('components/ui/icon');
var extend = require('extend');
var Form = require('components/ui/form');
var api = require('api');
var Verb = require('./verb');
var What = require('./what');
var When = require('./when');
var Where = require('./where');
var Preview = require('./preview');

module.exports = React.createClass({
    getInitialState: function() {
        return {
            step: 0,
            toggle: false,
            event: {
                semantics: {
                    who: {
                        isYou: true,
                        name: 'you'
                    },
                    what: [],
                    complements: [],
                    when: this.props.day || Date.now()
                }
            }
        };
    },
    onChange: function(data) {
        extend(this.state.event.semantics, data);
        this.setState({
            event: this.state.event
        });
    },
    toggle: function() {
        this.setState({
            toggle: !this.state.toggle
        });
    },
    close: function() {
        this.replaceState(this.getInitialState());
    },
    onSubmit: function(event) {
        if (event) {
            api.createEvent(event, function(event) {
                this.props.onEvent(event);
                this.close();
            }.bind(this));
        } else {
            this.close();
        }
    },
    onStep: function(event) {
        this.setState({
            step: parseInt(event.target.value)
        });
    },
    nextStep: function() {
        this.setState({
            step: this.state.step + 1
        });
    },
    previousStep: function() {
        this.setState({
            step: this.state.step - 1
        });
    },
    steps: function() {
        var semantics = this.state.event.semantics, steps = [], previous;
        steps.push(previous = {
            component: <Verb onChange={this.onChange} {...semantics}/>,
            icon: <Icon name="cube"/>,
            enabled: true,
            completed: semantics.verb
        });
        steps.push(previous = {
            component: <What onChange={this.onChange} {...semantics}/>,
        icon: <Icon name="lightbulb-o" verb={semantics.verb}/>,
            enabled: previous.completed && previous.enabled,
            completed: semantics.what.length && semantics.what[0].type
        });
        steps.push(previous = {
            component: <When onChange={this.onChange} {...semantics}/>,
            icon: <Icon name="clock-o"/>,
            enabled: previous.completed && previous.enabled,
            completed: semantics.when
        });
        steps.push(previous = {
            component: <Where onChange={this.onChange} {...semantics}/>,
            icon: <Icon name="map-marker"/>,
            enabled: previous.completed && previous.enabled,
            completed: semantics.where && semantics.where.name
        });
        steps.push({
            component: <Preview onChange={this.onSubmit} event={this.state.event}/>,
            icon: <Icon name="check"/>,
            enabled: previous.completed && previous.enabled
        });

        return steps;
    },
    render: function() {
        if (this.state.toggle) {
            var steps = this.steps(), step = steps[this.state.step];
            return <Form className="event-creator" onSubmit={this.nextStep}>
                <div>
                    {steps.map(function(step, i) {
                        return <label>
                            <input
                                type="radio" name="steps" value={i}
                                checked={i === this.state.step}
                                disabled={!step.enabled}
                                onChange={this.onStep}/>
                            {step.icon}
                        </label>;
                    }.bind(this))}
                </div>
                {step.component}
                {this.state.step < steps.length - 1 &&
                <button type="button" disabled={this.state.step === 0} onClick={this.previousStep}>
                    <Icon name="chevron-left"/> Back
                </button>}
                {this.state.step < steps.length - 1 &&
                <button type="submit" disabled={!step.completed}>
                    Next <Icon name="chevron-right"/>
                </button>}
            </Form>;
        } else {
            return <button className="event-creator" onClick={this.toggle}>
                <Icon name="plus"/> Add stuff
            </button>;
        }
    }
});
