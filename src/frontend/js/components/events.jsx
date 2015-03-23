var React = require('react');
var api = require('api');
var Loading = require('components/loading');
var ReaderImage = require('components/reader-image');
var moment = require('moment');

var Day = React.createClass({
    render: function() {
        var className = 'day';
        if (this.props.moment) {
            if (this.props.moment.startOf('day').isSame(moment().startOf('day'))) {
                className += ' today';
            }
        }
        return <div className={className}>{this.props.moment && this.props.moment.date()}</div>;
    }
});

var Week = React.createClass({
    render: function() {
        var days = [], now = this.props.moment;
        for (var day = 0; day < 7; day++) {
            var current = moment(now).day(day);
            if (current.month() == now.month()) {
                days.push(<Day moment={current}/>);
            } else {
                days.push(<Day/>);
            }
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
            weeks.push(<Week moment={moment(now)}/>);
        } while (now.add(1, 'weeks').month() == month);

        return <div className="month">
            <h4>{this.props.moment.format('MMMM')}</h4>
            {weeks}
        </div>;
    }
});

var Year = React.createClass({
    render: function() {
        var year = this.props.moment.year();
        var now = moment(this.props.moment).dayOfYear(1);
        var months = [];

        do {
            months.push(<Month moment={moment(now)}/>);
        } while (now.add(1, 'months').year() == year);

        return <div className="year">{months}</div>;
    }
});

module.exports = React.createClass({
    componentWillMount: function() {
        var self = this;
        api.events(function(events) {
            self.setState({events: events});
        });
    },
    render: function() {
        return <Year moment={moment()}/>;
        if (!this.state) return <Loading/>;
        return <section className="events">
            {this.state.events.map(function(event) {
                return <div><ReaderImage type={event.type}/></div>;
            })}
        </section>;
    }
});
