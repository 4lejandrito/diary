var React = require('react');
var Search = require('components/search');
var _ = require('underscore');
var ReaderImage = require('components/reader-image');

module.exports = React.createClass({
    getInitialState: function() {
        return {
            filter: {}
        };
    },
    filterText: function(events) {
        this.setState({byText: events}, this.filter);
    },
    filterType: function(event, type) {
        var filter = this.state.filter;
        filter[type] = !filter[type];
        this.setState({
            filter: filter,
            byType: _.filter(
                this.props.events,
                function(e) {
                    return !filter[e.type];
                }
            )
        }, this.filter);
    },
    filter: function() {
        this.props.onChange(
            _.intersection(
                this.state.byText || this.props.events,
                this.state.byType || this.props.events
            )
        );
    },
    render: function() {
        var filter = this.state.filter, filterType = this.filterType;
        return <div className="event-filter">
            <ul>
                {_.mapObject(
                    _.groupBy(this.state.byText || this.props.events, 'type'),
                    function(events, type) {
                        return <li>
                            <ReaderImage onClick={filterType} selected={!!filter[type]} type={type}/>
                        </li>;
                    }
                )}
            </ul>
            <Search
                placeholder="Search this timeline"
                list={this.props.events}
                onChange={this.filterText}/>
        </div>;
    }
});
