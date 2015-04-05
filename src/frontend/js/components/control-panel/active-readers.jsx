var React = require('react');
var api = require('api');
var ActiveReader = require('./active-reader');
var _ = require('underscore');
var Loading = require('components/loading');
var Icon = require('components/icon');
var Link = require('react-router').Link;
var Search = require('components/search');
var Sticky = require('react-sticky');

module.exports = React.createClass({
    getInitialState: function() {
        return {readers: undefined};
    },
    componentWillMount: function() {
        var self = this;
        api.on('reader.new', this.onReaderCreated = function(reader) {
            self.state.readers.push(reader);
            self.setReaders(self.state.readers);
        });
        api.on('reader.removed', this.onReaderRemoved = function(reader) {
            self.setReaders(_.without(self.state.readers, reader));
        });
        api.activeReaders(this.setReaders);
    },
    componentWillUnmount: function() {
        api.off('reader.new', this.onReaderCreated);
        api.off('reader.removed', this.onReaderRemoved);
    },
    setReaders: function(readers) {
        this.filter(readers);
        this.setState({readers: readers});
    },
    filter: function(readers) {
        this.setState({filteredReaders: readers});
    },
    render: function() {
        return <article className="active-readers">
            <Sticky type={React.DOM.header}>
                <h2>Services</h2>
                <h3>Manage your services</h3>
            </Sticky>
            {this.state.readers ? <div>
                <Search placeholder="Search your services" list={this.state.readers} onChange={this.filter}/>
                <Link className="button" to="/services/new"><Icon name="plus"/></Link>
                <ul>
                    {
                        this.state.filteredReaders.map(function(reader) {
                            return <ActiveReader reader={reader}/>;
                        })
                    }
                </ul>
            </div> : <Loading/>}
        </article>;
    }
});
