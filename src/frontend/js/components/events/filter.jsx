var React = require('react');
var Search = require('components/search');
var _ = require('underscore');
var ReaderImage = require('components/reader-image');
var api = require('api');

module.exports = React.createClass({
    getInitialState: function() {
        return {
            filter: {}
        };
    },
    componentWillReceiveProps: function(nextProps) {
        if (this.props.events != nextProps.events) {
            this.setState({byText: nextProps.events}, this.filter);
        }
    },
    onResultsByText: function(events) {
        this.setState({byText: events}, this.filter);
    },
    onTypeFilter: function(event, type) {
        this.state.filter[type] = !this.state.filter[type];
        this.setState({
            filter: this.state.filter
        }, this.filter);
    },
    filter: function() {
        var filter = this.state.filter;
        this.props.onChange(
            _.intersection(
                this.state.byText || this.props.events,
                _.filter(this.props.events || this.state.byText, function(e) {
                    return !filter[e.type];
                })
            )
        );
    },
    fetch: function(text, cb) {
        return api.events({
            q: text,
            year: this.props.year,
            month: this.props.month
        }, cb);
    },
    render: function() {
        var events = this.state.byText || this.props.events;
        if (!events && this.props.view) {
            events = [];
            this.props.view.map(function(g) {
                for (var i = 0; i < g.count; i++) {
                    events.push({type: g._id.type});
                }
            });
        }
        var filter = _.sortBy(_.pairs(_.groupBy(events, 'type')), function(pair) {
            return -pair[1].length;
        }).map(function(pair) {
            var type = pair[0], events = pair[1];
            return <li>
                {!this.state.filter[type] && <strong>{events.length}</strong>}
                <ReaderImage
                    onClick={this.onTypeFilter}
                    selected={!!this.state.filter[type]}
                    type={type}
                />
            </li>;
        }.bind(this));

        return <div className="event-filter">
            <ul>
                {filter.length ? filter : <strong>No results</strong>}
            </ul>
            <Search
                placeholder="Search your diary"
                source={this.props.events || this.fetch}
                onResults={this.onResultsByText}/>
        </div>;
    }
});
