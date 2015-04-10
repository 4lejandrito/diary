var React = require('react');
var api = require('api');
var Loading = require('components/loading');
var ReaderImage = require('components/reader-image');
var moment = require('moment');
var Link = require('react-router').Link;
var _ = require('underscore');
var Sticky = require('react-sticky');

var Month = React.createClass({
    render: function() {
        var params = {
            year: this.props.moment.year(),
            month: this.props.moment.month()
        };
        var totalNumberOfEvents = _.reduce(this.props.view, function(memo, e) {
            return memo + e.count;
        }, 0);
        var top = totalNumberOfEvents ? this.props.view.map(function(e) {
            return <ReaderImage type={e._id.type}/>;
        }) : <img src="http://upload.wikimedia.org/wikipedia/commons/a/aa/Empty_set.svg"/>;

        return <li className="month">
            <Link to="month" params={params} disabled={!totalNumberOfEvents}>
                <h3>{this.props.moment.format('MMMM')}</h3>
                {this.props.view ? top : null}
                <strong>
                    {!this.props.view ? <Loading/> : (totalNumberOfEvents || 'No data')}
                </strong>
            </Link>
        </li>;
    }
});

var Year = React.createClass({
    render: function() {
        var year = this.props.moment.year();
        var now = moment(this.props.moment).dayOfYear(1);
        var months = [];

        function filter(e) {
            return e._id.month - 1 === now.month();
        }

        do {
            months.push(<Month view={
                this.props.view && this.props.view.filter(filter)
            } moment={moment(now)}/>);
        } while (now.add(1, 'months').year() == year);

        return <ol className="year">{months}</ol>;
    }
});

module.exports = React.createClass({
    componentWillMount: function() {
        this.refresh(this.props.year);
    },
    componentWillReceiveProps: function(nextProps) {
        this.refresh(nextProps.year);
    },
    refresh: function(year) {
        var self = this;
        api.viewYear(year || moment().year(), function(err, view) {
            self.setState({view: view});
        });
        this.replaceState({});
    },
    render: function() {
        var day = moment().year(this.props.year || moment().year());

        return <article className="events-year">
            <Sticky type={React.DOM.header}>
                <Link to="year" params={{year: day.year() - 1}}>
                    {moment(day).subtract(1, 'years').format('gggg')}
                </Link>
                <h2>
                    {day.format('gggg')}
                </h2>
                <Link to="year" params={{year: day.year() + 1}}>
                    {moment(day).add(1, 'years').format('gggg')}
                </Link>
            </Sticky>
            <Year view={this.state.view} moment={day}/>
        </article>;
    }
});
