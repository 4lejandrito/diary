var React = require('react');
var moment = require('moment');
var Icon = require('components/icon');
var Event = require('components/event');
var extend = require('extend');
var Form = require('components/form');
var _ = require('underscore');
var api = require('api');

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
                    when: Date.now()
                }
            }
        };
    },
    onChange: function(data) {
        extend(this.state.event.semantics, data);
        this.setState({
            step: this.state.step + 1,
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
    render: function() {
        var semantics = this.state.event.semantics;
        if (this.state.toggle) {
            return <div className="event-creator">
                {[
                    <Verb onChange={this.onChange} {...semantics}/>,
                    <What onChange={this.onChange} {...semantics}/>,
                    <When onChange={this.onChange} {...semantics}/>,
                    <Where onChange={this.onChange} {...semantics}/>,
                    <Preview onChange={this.onSubmit} event={this.state.event}/>
                ][this.state.step]}
            </div>;
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
        return <Form className="preview" onSubmit={this.onAccept}>
            <header>Are you happy with this?</header>
            <Event event={this.props.event}/>
            <button type="submit">
                <Icon name="check"/> Yes
            </button>
            <button onClick={this.onReject}>
                <Icon name="close"/> No, scratch that
            </button>
        </Form>;
    }
});

var Where = React.createClass({
    getInitialState: function() {
        return {where: {}};
    },
    componentDidMount: function() {
        var autocomplete = new google.maps.places.Autocomplete(
            this.refs.search.getDOMNode()
        );
        google.maps.event.addListener(autocomplete, 'place_changed', this.onChange);
        this.setState({
            autocomplete: autocomplete
        });
    },
    onChange: function() {
        var place = this.state.autocomplete.getPlace();
        this.setState({
            where: {
                name: place.name,
                coordinates: [place.geometry.location.lng(), place.geometry.location.lat()],
                country: this.findComponent(place, 'country'),
                city: this.findComponent(place, 'locality')
            }
        });
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
        return <Form className="where" onSubmit={this.onSubmit}>
            <header>
                <Icon name="map-marker"/> Where {this.props.who.name}
                {' '}
                {this.props.verb}
                {' '}
                {this.props.what[0].article}
                {' '}
                {this.props.what[0].type}
                ?:
            </header>
            <input ref='search' autoFocus={true} placeholder="find a place"/>
            <div><small>Examples: <i>Madrid, Spain, UK...</i></small></div>
            <button type="submit" disabled={!this.state.where.name}>
                Next <Icon name="chevron-right"/>
            </button>
        </Form>;
    }
});

var Verb = React.createClass({
    getInitialState: function() {
        return {};
    },
    onSubmit: function() {
        this.props.onChange({
            verb: this.state.verb
        });
    },
    onChange: function() {
        this.setState({
            verb: this.refs.verb.getDOMNode().value
        });
    },
    render: function() {
        return <Form className="verb" onSubmit={this.onSubmit}>
            <header>
                <Icon name="cube"/> What did {this.props.who.name} do?:
            </header>
            I{' '}
            <input
                ref="verb"
                autoFocus={true}
                placeholder="verb in past tense"
                value={this.state.verb}
                onChange={this.onChange}/>
            <div><small>Examples: <i>watched, read, cooked...</i></small></div>
            <button type="submit" disabled={!this.state.verb}>
                Next <Icon name="chevron-right"/>
            </button>
        </Form>;
    }
});

var What = React.createClass({
    getInitialState: function() {
        return {};
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
        });
    },
    render: function() {
        return <Form className="what" onSubmit={this.onSubmit}>
            <header>
                <Icon verb={this.props.verb}/> What was that {this.props.who.name} {this.props.verb}?:
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
            <button type="submit" disabled={!this.state.type}>
                Next <Icon name="chevron-right"/>
            </button>
        </Form>;
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
        });
    },
    render: function() {
        return <Form className="when" onSubmit={this.onSubmit}>
            <header>
                <Icon name="clock-o"/> What time {this.props.who.name}
                {' '}
                {this.props.verb}
                {' '}
                {this.props.what[0].article}
                {' '}
                {this.props.what[0].type}
                ?:
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
            <button type="submit">
                Next <Icon name="chevron-right"/>
            </button>
        </Form>;
    }
});
