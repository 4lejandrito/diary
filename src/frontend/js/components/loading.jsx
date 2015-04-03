var React = require('react');
var Icon = require('components/icon');

module.exports = React.createClass({
    render: function() {
        return <div className="loading">
            <Icon name="circle-o-notch" spin={true}/>
        </div>;
    }
});
