var React = require('react');
var api = require('api');
var AvailableReader = require('./available-reader');
var _ = require('underscore');
var Loading = require('components/loading');
var Search = require('components/search');
var Sticky = require('react-sticky');

module.exports = React.createClass({
    getInitialState: function() {
        return {filter: '', readers: undefined};
    },
    componentWillMount: function() {
        var self = this;
        api.availableReaders(function(readers) {
            self.setState({readers: readers});
        });
    },
    filter: function(value) {
        this.setState({filter: value});
    },
    render: function() {
        return <article className="available-readers">
            <Sticky type={React.DOM.header}>
                <h2>New service</h2>
                <h3>Add a new service integration</h3>
            </Sticky>
            {this.state.readers ? <div>
                <Search placeholder="Find a service" onChange={this.filter}/>
                <ul>
                    {
                        _.filter(this.state.readers, function(reader) {
                            return reader.type.indexOf(this.state.filter) != -1;
                        }, this).map(function(reader) {
                            return <AvailableReader reader={reader}/>;
                        })
                    }
                </ul>
            </div> : <Loading/>}
        </article>;
    }
});
