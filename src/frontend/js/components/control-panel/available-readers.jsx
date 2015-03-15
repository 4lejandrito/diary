var React = require('react');
var api = require('api');
var AvailableReader = require('./available-reader');
var _ = require('underscore');
var Loading = require('components/loading');
var Icon = require('components/icon');

module.exports = React.createClass({
    getInitialState: function() {
        return {filter: ''};
    },
    filter: function(event) {
        this.setState({filter: event.target.value});
    },
    render: function() {
        return this.props.readers.length ? <article>
            <Icon name="search"/>
            <input type="text" placeholder="Find a service" onChange={this.filter}/>
            <div>
                {
                    _.filter(this.props.readers, function(reader) {
                        return reader.type.indexOf(this.state.filter) != -1;
                    }, this).map(function(reader) {
                        return <AvailableReader reader={reader}/>;
                    })
                }
            </div>
        </article> : <Loading/>;
    }
});
