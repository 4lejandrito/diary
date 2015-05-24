var React = require('react');
var api = require('api');
var Loading = require('components/loading');
var ReaderImage = require('components/reader-image');
var Event = require('components/event');
var Icon = require('components/icon');
var moment = require('moment');
var _ = require('underscore');

module.exports = React.createClass({
    getInitialState: function() {
        return {events: []};
    },
    onChange: function() {
        this.setState({
            filter: this.refs.search.getDOMNode().value,
            loading: true
        }, this.search);
    },
    search: function() {
        if (this.state.request) this.state.request.abort();
        this.setState({
            request: api.events(this.state.filter, function(err, events) {
                this.setState({
                    events: events,
                    loading: false
                });
            }.bind(this))
        });
    },
    render: function() {
        return <div className="events">
            <input
                ref="search"
                autoFocus={true}
                type="text"
                placeholder='Search babe'
                onChange={_.debounce(this.onChange, 200)}
            />
            {this.state.loading && <Loading/>}
            {
                !this.state.loading && this.state.events.length === 0 && this.state.filter &&
                <div className="nothing">No results found</div>
            }
            {!this.state.loading && this.state.events.length > 0 &&
            <ol>
                {this.state.events.map(function(e) {
                    return <li>
                        <ReaderImage type={e.type}/>
                        <Event event={e}/>
                        <time>
                            <Icon name="clock-o"/>{' '}
                            {moment(e.date).format('MMMM Do gggg HH:mm')}
                        </time>
                    </li>;
                })}
            </ol>}
        </div>;
    }
});
