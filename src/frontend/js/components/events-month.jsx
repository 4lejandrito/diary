var React = require('react');
var api = require('api');
var Loading = require('components/loading');
var ReaderImage = require('components/reader-image');
var moment = require('moment');
var Link = require('react-router').Link;
var _ = require('underscore');

var Day = React.createClass({
    render: function() {
        var className = 'day';
        if (this.props.moment.startOf('day').isSame(moment().startOf('day'))) {
            className += ' today';
        }
        var totalNumberOfEvents = _.reduce(this.props.view, function(memo, e) {
            return memo + e.count;
        }, 0);
        var top = totalNumberOfEvents ? this.props.view.map(function(e) {
            return <ReaderImage type={e._id.type}/>;
        }) : <img src="http://upload.wikimedia.org/wikipedia/commons/a/aa/Empty_set.svg"/>;

        return <Link to="/" disabled={this.props.disabled || !totalNumberOfEvents} className={className}>
            <h4>{this.props.moment.date()}</h4>
            {top}
            <strong>{totalNumberOfEvents || 'No data'}</strong>
        </Link>;
    }
});

var Week = React.createClass({
    render: function() {
        var days = [], now = this.props.moment;
        function filter(e) {
            return e._id.day === now.date();
        }
        for (var day = 0; day < 7; day++) {
            var current = moment(now).day(day);
            days.push(<Day
                view={this.props.view.filter(filter)}
                disabled={current.month() !== now.month()}
                moment={current}
            />);
        }
        return <div>{days}</div>;
    }
});

var Month = React.createClass({
    render: function() {
        var month = this.props.moment.month();
        var now = moment(this.props.moment).date(1);
        var weeks = [];

        do {
            weeks.push(<Week view={this.props.view} moment={moment(now)}/>);
        } while (now.add(1, 'weeks').month() == month);

        return <div className="month">
            {weeks}
        </div>;
    }
});

module.exports = React.createClass({
    componentWillMount: function() {
        this.refresh(this.props.year, this.props.month);
    },
    componentWillReceiveProps: function(nextProps) {
        this.refresh(nextProps.year, nextProps.month);
    },
    refresh: function(year, month) {
        var self = this;
        api.viewMonth(year || moment().year(), month || moment().month(), function(view) {
            self.setState({view: view});
        });
        this.replaceState({});
    },
    render: function() {
        if (!this.state) return <Loading/>;

        var day = moment()
        .year(parseInt(this.props.year))
        .month(parseInt(this.props.month));

        return <section className="events-month">
            <h4>
                <Link to="month" params={{year: day.year(), month: day.month() - 1}}>
                    {moment(day).subtract(1, 'months').format('MMM')}
                </Link>
            </h4>
            <h2>{day.format('MMMM')}</h2>
            <h4>
                <Link to="month" params={{year: day.year(), month: day.month() + 1}}>
                    {moment(day).add(1, 'months').format('MMM')}
                </Link>
            </h4>
            <div><h4>{day.format('gggg')}</h4></div>
            <Month view={this.state.view || []} moment={moment(day)}/>
        </section>;
    }
});
