var React = require('react');
var moment = require('moment');
var Icon = require('components/icon');
var Event = require('components/event');
var extend = require('extend');
var Form = require('components/form');
var _ = require('underscore');
var api = require('api');
var Button = require('components/button');

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

var Preview = React.createClass({
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

var Where = React.createClass({
    getInitialState: function() {
        return {where: this.props.where || {}};
    },
    componentDidMount: function() {
        var autocomplete = new google.maps.places.Autocomplete(
            this.refs.search.getDOMNode()
        );
        google.maps.event.addListener(autocomplete, 'place_changed', function() {
            this.onChange(autocomplete.getPlace());
        }.bind(this));
    },
    getCurrentLocation: function() {
        navigator.geolocation.getCurrentPosition(function(pos) {
            new google.maps.Geocoder().geocode({
                latLng: new google.maps.LatLng(pos.coords.latitude,pos.coords.longitude)
            }, function(results) {
                this.onChange(results[0]);
            }.bind(this));
        }.bind(this));
        this.onChange();
        this.setState({loading: true});
    },
    onChange: function(place) {
        this.setState({
            loading: false,
            where: place ? {
                name: place.name || this.findComponent(place, 'route') || this.findComponent(place, 'locality'),
                coordinates: [place.geometry.location.lng(), place.geometry.location.lat()],
                country: this.findComponent(place, 'country'),
                city: this.findComponent(place, 'locality'),
                zip: this.findComponent(place, 'postal_code')
            } : {}
        }, this.onSubmit);
    },
    findComponent: function(result, type) {
        var component = _.find(result.address_components, function(component) {
            return _.include(component.types, type);
        });
        return component && component.short_name;
    },
    onSubmit: function() {
        this.props.onChange({
            where: this.state.where
        });
    },
    render: function() {
        return <div className="where">
            <header>
                Where {this.props.who.name}
                {' '}
                {this.props.verb}
                {' '}
                {this.props.what[0].article}
                {' '}
                {this.props.what[0].type}
                ?
            </header>
            <div className="location">
                <input
                    ref='search'
                    autoFocus={true}
                    placeholder="find a place"
                    value={this.state.where.name}
                    onChange={function() {this.onChange();}.bind(this)}
                    disabled={this.state.loading}
                />
                {navigator.geolocation &&
                <Button
                    loading={this.state.loading}
                    icon="location-arrow"
                    type="button"
                    onClick={this.getCurrentLocation}/>}
            </div>
            <div><small>Examples: <i>Madrid, Spain, UK...</i></small></div>
        </div>;
    }
});

var Verb = React.createClass({
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

var What = React.createClass({
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

var When = React.createClass({
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
