var React = require('react');
var AvailableReaders = require('./available-readers');
var ActiveReaders = require('./active-readers');
var Gravatar = require('react-gravatar');
var Icon = require('components/icon');
var api = require('api');

module.exports = React.createClass({
    getInitialState: function() {
        return {adding: false};
    },
    componentWillMount: function() {
        var self = this;
        api.on('reader.new', function() {
            self.toggle();
        });
    },
    toggle: function() {
        this.setState({adding: !this.state.adding});
    },
    render: function() {
        return <section className="control-panel">
            <header>
                <h2>Settings</h2>
                <Gravatar email={this.props.user.email} size={200}/>
            </header>
            <section>
                <button onClick={this.toggle}>
                    <Icon name={this.state.adding ? "minus" : 'plus'}/>
                    {' ' + 'Add new service'}
                </button>
                {this.state.adding ? <AvailableReaders/> : <ActiveReaders/>}
            </section>
        </section>;
    }
});
