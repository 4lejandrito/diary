var React = require('react');
var api = require('api');
var Loading = require('components/loading');
var ReaderImage = require('components/reader-image');
var moment = require('moment');
var Link = require('react-router').Link;
var _ = require('underscore');

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

        return <div className="month">
            <Link to="month" params={params} disabled={!totalNumberOfEvents}>
                <h4>{this.props.moment.format('MMMM')}</h4>
                {top}
                <strong>{totalNumberOfEvents || 'No data'}</strong>
            </Link>
        </div>;
    }
});

var Year = React.createClass({
    render: function() {
        if (!this.props.view) return <Loading/>;

        var year = this.props.moment.year();
        var now = moment(this.props.moment).dayOfYear(1);
        var months = [];

        function filter(e) {
            return e._id.month - 1 === now.month();
        }

        do {
            months.push(<Month view={this.props.view.filter(filter)} moment={moment(now)}/>);
        } while (now.add(1, 'months').year() == year);

        return <div className="year">{months}</div>;
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
        api.viewYear(year || moment().year(), function(view) {
            self.setState({view: view});
        });
        this.replaceState({});
    },
    render: function() {
        var day = moment().year(this.props.year || moment().year());

        return <section className="events-year">
            <h4>
                <Link to="year" params={{year: day.year() - 1}}>
                    {moment(day).subtract(1, 'years').format('gggg')}
                </Link>
            </h4>
            <h2>{day.format('gggg')}</h2>
            <h4>
                <Link to="year" params={{year: day.year() + 1}}>
                    {moment(day).add(1, 'years').format('gggg')}
                </Link>
            </h4>
            <Year view={this.state.view || []} moment={day}/>
        </section>;
    }
});