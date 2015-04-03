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
        return {filter: '', readers: undefined};
    },
    componentWillMount: function() {
        var self = this;
        api.on('reader.new', this.onReaderCreated = function(reader) {
            self.state.readers.push(reader);
            self.setState({readers: self.state.readers});
        });
        api.on('reader.removed', this.onReaderRemoved = function(reader) {
            self.setState({
                readers: _.without(self.state.readers, reader)
            });
        });
        api.activeReaders(function(readers) {
            self.setState({readers: readers});
        });
    },
    componentWillUnmount: function() {
        api.off('reader.new', this.onReaderCreated);
        api.off('reader.removed', this.onReaderRemoved);
    },
    filter: function(value) {
        this.setState({filter: value});
    },
    render: function() {
        return <section className="active-readers">
            <Sticky type={React.DOM.header}>
                <h2>Services</h2>
                <h4>Manage your services</h4>
            </Sticky>
            {this.state.readers ? <div>
                <Search placeholder="Search your services" onChange={this.filter}/>
                <Link className="button" to="/services/new"><Icon name="plus"/></Link>
                <ul>
                    {
                        _.filter(this.state.readers, function(reader) {
                            return reader.type.indexOf(this.state.filter) != -1;
                        }, this).map(function(reader) {
                            return <ActiveReader reader={reader}/>;
                        })
                    }
                </ul>
            </div> : <Loading/>}
        </section>;
    }
});
