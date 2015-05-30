var React = require('react');
var api = require('api');
var AvailableReader = require('./available-reader');
var Loading = require('components/loading');
var Search = require('components/search');
var Sticky = require('react-sticky');

module.exports = React.createClass({
    getInitialState: function() {
        return {readers: undefined};
    },
    componentWillMount: function() {
        api.availableReaders(this.setReaders);
    },
    setReaders: function(err, readers) {
        this.filter(readers);
        this.setState({readers: readers});
    },
    filter: function(readers) {
        this.setState({filteredReaders: readers});
    },
    render: function() {
        return <article className="available-readers">
            <Sticky type={React.DOM.header}>
                <h2>New service</h2>
                <h3>Add a new service integration</h3>
            </Sticky>
            {this.state.filteredReaders ? <div>
                <Search placeholder="Find a service" source={this.state.readers} onResults={this.filter}/>
                <ul>
                    {
                        this.state.filteredReaders.map(function(reader) {
                            return <AvailableReader reader={reader}/>;
                        })
                    }
                </ul>
            </div> : <Loading/>}
        </article>;
    }
});
