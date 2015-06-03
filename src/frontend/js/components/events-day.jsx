var React = require('react');
var api = require('api');
var Loading = require('components/loading');
var ReaderImage = require('components/reader-image');
var moment = require('moment');
var Link = require('components/link');
var Icon = require('components/icon');
var Sticky = require('react-sticky');
var Filter = require('components/event-filter');
var Event = require('components/event');
var Cover = require('components/cover');

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
        api.viewDay(year, month, day, function(err, events) {
            self.setState({
                events: events,
                filteredEvents: events
            });
        });
        this.replaceState({});
    },
    filter: function(events) {
        this.setState({filteredEvents: events});
    },
    render: function() {
        var day = moment()
        .year(parseInt(this.props.year))
        .month(parseInt(this.props.month))
        .date(parseInt(this.props.day));
        var previous = moment(day).subtract(1, 'days');
        var next = moment(day).add(1, 'days');

        return <article className="events-day">
            <Sticky type={React.DOM.header}>
                <Link to="day" params={{
                    year: previous.year(),
                    month: previous.month(),
                    day: previous.date()
                }}>
                    {previous.format('ddd')}
                </Link>
                <h2>{day.format('dddd')}</h2>
                <Link to="day" params={{
                    year: next.year(),
                    month: next.month(),
                    day: next.date()
                }}>
                    {next.format('ddd')}
                </Link>
                <h3>{day.format('MMMM Do gggg')}</h3>
                <Cover year={day.year()} month={day.month()} day={day.date()}/>
                {
                    this.state.events && !!this.state.events.length &&
                    <Filter events={this.state.events} onChange={this.filter}/>
                }
            </Sticky>
            {
                !this.state.events && <Loading/>
            }
            {
                this.state.events && !!this.state.events.length &&
                <ol>
                    {this.state.filteredEvents.map(function(e) {
                        return <li>
                            <ReaderImage type={e.type}/>
                            <time>
                                <Icon name="clock-o"/>{' '}
                                {moment(e.date).format('HH:mm')}
                            </time>
                            <Event event={e}/>
                        </li>;
                    })}
                </ol>
            }
            {
                this.state.events &&
                !this.state.events.length &&
                <div className="nothing">No data</div>
            }
            {
                this.state.events &&
                !!this.state.events.length &&
                !this.state.filteredEvents.length &&
                <div className="nothing">No results found</div>
            }
            {
                this.state.events &&
                <Link className="button" to="day" params={{
                    year: next.year(),
                    month: next.month(),
                    day: next.date()
                }}>
                    {next.format('dddd')}  <Icon name="forward"/>
                </Link>
            }
        </article>;
    }
});
