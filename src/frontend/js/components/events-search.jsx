var React = require('react');
var ReaderImage = require('components/reader-image');
var Event = require('components/event');
var Icon = require('components/icon');
var moment = require('moment');
var Filter = require('components/event-filter');

module.exports = React.createClass({

    getInitialState: function() {
        return {};
    },
    getDefaultProps: function() {
        return {
            onEvents: function() {}
        };
    },
    onEvents: function(events) {
        this.setState({
            events: events
        });
        this.props.onEvents(events);
    },
    render: function() {
        return <div className="events">
            <Filter {...this.props}
                onChange={this.onEvents}
            />
            {this.state.events && this.state.events.length > 0 &&
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
