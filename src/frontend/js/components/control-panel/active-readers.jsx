var React = require('react');
var api = require('api');
var ActiveReader = require('./active-reader');
var _ = require('underscore');
var Loading = require('components/loading');

module.exports = React.createClass({
    getInitialState: function() {
        return {};
    },
    componentWillMount: function() {
        var self = this;
        api.on('reader.removed', function(reader) {
            self.setState({
                readers: _.without(self.state.readers, reader)
            });
        });
        api.on('reader.new', function(reader) {
            self.state.readers.push(reader);
            self.setState({readers: self.state.readers});
        });
        api.activeReaders(function(readers) {
            self.setState({readers: readers});
        });
    },
    render: function() {
        return <section>
            {this.state.readers ?
            <div>
                {
                    this.state.readers.map(function(reader) {
                        return <ActiveReader reader={reader}/>;
                    }, this)
                }
            </div> : <Loading/>}
        </section>;
    }
});
