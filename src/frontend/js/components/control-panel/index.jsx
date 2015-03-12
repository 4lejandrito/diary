var React = require('react');
var AvailableReaders = require('./available-readers');
var ActiveReaders = require('./active-readers');
var Icon = require('components/icon');
var api = require('api');
var _ = require('underscore');

module.exports = React.createClass({
    getInitialState: function() {
        return {
            adding: false,
            availableReaders: [],
            activeReaders: []
        };
    },
    componentWillMount: function() {
        var self = this;
        api.on('reader.new', function(reader) {
            self.state.activeReaders.push(reader);
            self.setState({activeReaders: self.state.activeReaders});
            self.toggle();
        });
        api.on('reader.removed', function(reader) {
            self.setState({
                activeReaders: _.without(self.state.activeReaders, reader)
            });
        });
        api.activeReaders(function(readers) {
            self.setState({activeReaders: readers});
        });
        api.availableReaders(function(readers) {
            self.setState({availableReaders: readers});
        });
    },
    toggle: function() {
        this.setState({adding: !this.state.adding});
    },
    render: function() {
        return <section className="control-panel">
            <header>
                <h2>Settings</h2>
            </header>
            <section>
                <button onClick={this.toggle}>
                    <Icon name={this.state.adding ? "minus" : 'plus'}/>
                    {' ' + 'Add new service'}
                </button>
                {
                    this.state.adding ?
                    <AvailableReaders readers={this.state.availableReaders}/> :
                    <ActiveReaders readers={this.state.activeReaders}/>
                }
            </section>
        </section>;
    }
});
