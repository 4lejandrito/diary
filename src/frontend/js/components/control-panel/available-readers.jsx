var React = require('react');
var api = require('api');
var AvailableReader = require('./available-reader');
var _ = require('underscore');
var Loading = require('components/loading');

module.exports = React.createClass({
    getInitialState: function() {
        return {filter: ''};
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
        return <div>
            <h3>Available readers</h3>
            <input type="text" placeholder="Filter readers" onChange={this.filter}/>
            {this.state.readers ? <ul>
                {filteredReaders.map(function(reader) {
                    return <li>
                        <AvailableReader reader={reader}/>
                    </li>;
                })}
            </ul> : <Loading/>}
        </div>;
    }
});
