var React = require('react');
var api = require('api');
var Loading = require('components/loading');
var Icon = require('components/icon');
var Navigation = require('react-router').Navigation;
var Router = require('react-router');
var _ = require('underscore');

module.exports = React.createClass({
    mixins: [Navigation, Router.State],
    addReader: function() {
        var self = this;
        api.addReader(this.state.reader.type, _.mapObject(this.refs, function(ref, name) {
            var numberValue = parseFloat(ref.getDOMNode().value);
            var isNumber = !isNaN(numberValue) && isFinite(numberValue);
            return isNumber ? numberValue : ref.getDOMNode().value;
        }), function() {
            self.transitionTo('/services');
        });
    },
    componentWillMount: function() {
        var self = this;
        api.getAvailableReader(this.getParams().type, function(reader) {
            self.setState({reader: reader});
        });
    },
    render: function() {
        if (!this.state) return <Loading/>;
        return <article className="new-reader">
            <h2>{this.state.reader.type}</h2>
            <h4>{this.state.reader.description}</h4>
            <img src={'/api/reader/' + this.state.reader.type + '/picture'}/>
            {
                _.mapObject(this.state.reader.schema, function(val, key) {
                    return <div className="param">
                        <label>{key}</label>
                        <input ref={key} defaultValue={val}/>
                    </div>;
                })
            }
            <button onClick={this.addReader}><Icon name="plus"/> Add</button>
        </article>;
    }
});
