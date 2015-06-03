var React = require('react');
var api = require('api');
var moment = require('moment');
var _ = require('underscore');

module.exports = React.createClass({
    getInitialState: function() {
        return {};
    },
    componentWillMount: function() {
        this.refresh(this.props);
    },
    componentWillReceiveProps: function(nextProps) {
        if (!_.isEqual(nextProps, this.props)) this.refresh(nextProps);
    },
    refresh: function(props) {
        if (!props.year) return;
        api.events({
            year: props.year,
            month: props.month,
            day: props.day,
            what: ['picture', 'video'],
            pageSize: 10
        }, function(err, events) {
            this.setState({photoEvents: events});
        }.bind(this));
    },
    render: function() {
        return <div className="cover">
            <div className="background"></div>
            {(this.state.photoEvents && this.state.photoEvents.length > 5) ?
            _.map(this.state.photoEvents, function(e) {
                return <img
                    style={{width: (100 / this.state.photoEvents.length) + '%'}}
                    src={e.semantics.what[0].picture}
                />;
            }.bind(this)) :
            <img src="cover.jpg"/>}
        </div>;
    }
});
