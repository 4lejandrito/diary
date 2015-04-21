var React = require('react');
var api = require('api');
var Icon = require('components/icon');
var Link = require('components/link');
var Gravatar = require('react-gravatar');

module.exports = React.createClass({
    getInitialState: function() {
        return {disabled: false};
    },
    remove: function(event) {
        event.stopPropagation();
        event.preventDefault();
        api.removeReader(this.props.reader);
        this.setState({disabled: true});
    },
    render: function() {
        var className = '';
        if (this.props.reader.error) {
            className += 'error';
        }
        return <li className="active-reader">
            <div className={className}>
                <h4>{this.props.reader.type}</h4>
                <img src={'/api/reader/' + this.props.reader.type + '/picture'}/>
                <footer>
                    {this.props.reader.profile &&
                    <span className="info">
                        {this.props.reader.profile.photos ?
                        <img src={this.props.reader.profile.photos[0].value}/> :
                        <Gravatar email={this.props.reader.profile.emails[0].value} size={200}/>}
                        {this.props.reader.profile.displayName}
                    </span>}
                    <button className="danger" onClick={this.remove}>
                        <Icon name="close"/>
                    </button>
                </footer>
            </div>
        </li>;
    }
});
