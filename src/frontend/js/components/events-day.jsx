var React = require('react');
var api = require('api');
var Loading = require('components/loading');
var ReaderImage = require('components/reader-image');
var moment = require('moment');
var Link = require('components/link');
var _ = require('underscore');
var Icon = require('components/icon');
var eventComponents = require('./events/*', {hash: true});

var Event = React.createClass({
    render: function() {
        var Component = eventComponents[this.props.event.type];

        return <li className="event">
            <ReaderImage type={this.props.event.type}/>
            <time>
                <Icon name="clock-o"/>{' '}
                {moment(this.props.event.date).format('HH:mm')}
            </time>
            <div className="content">
                {Component ? <Component event={this.props.event}/> : <div>
                    <header>
                        {this.props.event.description || this.props.event.type}
                    </header>
                    {this.props.event.image ? <img src={this.props.event.image}/> : null}
                </div>}
            </div>
        </li>;
    }
});

module.exports = React.createClass({
    getInitialState: function() {
        return {};
    },
    componentWillMount: function() {
        this.refresh(this.props.year, this.props.month, this.props.day);
    },
    componentWillReceiveProps: function(nextProps) {
        this.refresh(nextProps.year, nextProps.month, nextProps.day);
    },
    refresh: function(year, month, day) {
        var self = this;
        api.viewDay(year, month, day, function(events) {
            self.setState({events: events});
        });
    },
    render: function() {
        var day = moment()
        .year(parseInt(this.props.year))
        .month(parseInt(this.props.month))
        .date(parseInt(this.props.day));
        var previous = moment(day).subtract(1, 'days');
        var next = moment(day).add(1, 'days');

        if (!this.state.events) return <Loading/>;

        return <section className="events-day">
            <h4>
                <Link to="day" params={{
                    year: previous.year(),
                    month: previous.month(),
                    day: previous.date()
                }}>
                    {previous.format('ddd')}
                </Link>
            </h4>
            <h2>{day.format('dddd')}</h2>
            <h4>
                <Link to="day" params={{
                    year: next.year(),
                    month: next.month(),
                    day: next.date()
                }}>
                    {next.format('ddd')}
                </Link>
            </h4>
            <div><h4>{day.format('MMMM Do gggg')}</h4></div>
            <ol className="events">
                {this.state.events.map(function(e) {
                    return <Event event={e}/>;
                })}
            </ol>
        </section>;
    }
});
