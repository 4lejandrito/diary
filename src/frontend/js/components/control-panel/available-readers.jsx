var React = require('react');
var api = require('api');
var AvailableReader = require('./available-reader');
var _ = require('underscore');
var Loading = require('components/loading');
var Icon = require('components/icon');

module.exports = React.createClass({
    getInitialState: function() {
        return {filter: '', readers: []};
    },
    componentWillMount: function() {
        var self = this;
        api.availableReaders(function(readers) {
            self.setState({readers: readers});
        });
    },
    filter: function(event) {
        this.setState({filter: event.target.value});
    },
    render: function() {
        var filteredReaders = _.filter(this.state.readers, function(reader) {
            return reader.type.indexOf(this.state.filter) != -1;
        }, this);
        return <section>
            <Icon name="search"/> <input type="text" placeholder="Find a service" onChange={this.filter}/>
            {this.state.readers.length ? <div>
                {filteredReaders.map(function(reader) {
                    return <AvailableReader reader={reader}/>;
                })}
            </div> : <Loading/>}
        </section>;
    }
});
