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
    componentWillReceiveProps: function(nextProps) {
        if (this.props.events != nextProps.events) {
            this.setState({byText: nextProps.events}, this.filter);
        }
    },
    filterText: function(events) {
        this.setState({byText: events}, this.filter);
    },
    filterType: function(event, type) {
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
                _.filter(this.props.events, function(e) {
                    return !filter[e.type];
                })
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
                            {!filter[type] && <strong>{events.length}</strong>}
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
