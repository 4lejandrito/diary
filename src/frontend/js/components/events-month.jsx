var React = require('react');
var api = require('api');
var Loading = require('components/loading');
var ReaderImage = require('components/reader-image');
var moment = require('moment');
var Link = require('react-router').Link;
var _ = require('underscore');
var Sticky = require('react-sticky');

var Day = React.createClass({
    render: function() {
        var className = 'day';
        if (this.props.moment.startOf('day').isSame(moment().startOf('day'))) {
            className += ' today';
        }

        var top = !_.isEmpty(this.props.view) ? this.props.view.sort(function(a, b){
            return b.count - a.count;
        }).map(function(e) {
            return <div className="top">
                <ReaderImage type={e._id.type}/>
                <strong>{e.count}</strong>
            </div>;
        }) : (this.props.view ? <strong>No data</strong> : <Loading/>);

        return <li className={className}>
            <Link to='day' params={{
                year: this.props.moment.year(),
                month: this.props.moment.month(),
                day: this.props.moment.date()
            }} disabled={_.isEmpty(this.props.view)}>
                <hgroup>
                    <h4>{this.props.moment.format('dddd')}</h4>
                    <h5>{this.props.moment.date()}</h5>
                </hgroup>
                {top}
            </Link>
        </li>;
    }
});

var Month = React.createClass({
    render: function() {
        var month = this.props.moment.month();
        var now = moment(this.props.moment).date(1);
        var days = [];

        function filter(e) {
            return e._id.day === now.date();
        }

        do {
            days.push(<Day view={
                this.props.view && this.props.view.filter(filter)
            } moment={moment(now)}/>);
        } while (now.add(1, 'days').month() == month);

        return <ol className="month">
            {days}
        </ol>;
    }
});

module.exports = React.createClass({
    getInitialState: function() {
        return {};
    },
    componentWillMount: function() {
        this.refresh(this.props.year, this.props.month);
    },
    componentWillReceiveProps: function(nextProps) {
        this.refresh(nextProps.year, nextProps.month);
    },
    refresh: function(year, month) {
        var self = this;
        api.viewMonth(year, month, function(view) {
            self.setState({view: view});
        });
        this.replaceState({});
    },
    render: function() {
        var day = moment()
        .year(parseInt(this.props.year))
        .month(parseInt(this.props.month));
        var previous = moment(day).subtract(1, 'months');
        var next = moment(day).add(1, 'months');

        return <article className="events-month">
            <Sticky type={React.DOM.header}>
                <Link to="month" params={{year: previous.year(), month: previous.month()}}>
                    {moment(day).subtract(1, 'months').format('MMM')}
                </Link>
                <h2>{day.format('MMMM')}</h2>
                <Link to="month" params={{year: next.year(), month: next.month()}}>
                    {moment(day).add(1, 'months').format('MMM')}
                </Link>
                <h3>{day.format('gggg')}</h3>
            </Sticky>
            <Month view={this.state.view} moment={moment(day)}/>
        </article>;
    }
});
