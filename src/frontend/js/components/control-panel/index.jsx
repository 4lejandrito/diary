var React = require('react');
var AvailableReaders = require('./available-readers');
var ActiveReaders = require('./active-readers');

module.exports = React.createClass({
    render: function() {
        return <div>
            <h2>Control panel - {this.props.user.email}</h2>
            <ActiveReaders/>
            <AvailableReaders/>
        </div>;
    }
});
