var React = require('react');
var api = require('api');
var Loading = require('components/loading');
var Icon = require('components/icon');
var Navigation = require('react-router').Navigation;
var Router = require('react-router');
var _ = require('underscore');
var ReaderImage = require('components/reader-image');

module.exports = React.createClass({
    mixins: [Navigation, Router.State],
    addReader: function() {
        var self = this;
        api.addReader(this.state.reader.type, _.mapObject(this.refs, function(ref, name) {
            var value = ref.getDOMNode().value;
            return !isNaN(value) ? parseFloat(value) : value;
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
        return <section className="new-reader">
            <header>
                <h2>{this.state.reader.type}</h2>
                <h4>{this.state.reader.description}</h4>
            </header>
            <ReaderImage type={this.state.reader.type}/>
            {
                this.state.reader.schema.oauth2 ?
                <a className="button" href={'/auth/' + this.state.reader.type}>
                    <Icon name="plus"/> Add
                </a> :
                _.mapObject(this.state.reader.schema, function(val, key) {
                    return <div className="param">
                        <label>{key}</label>
                        <input ref={key} defaultValue={val}/>
                    </div>;
                })
            }
            {!this.state.reader.schema.oauth2 ?
                <button onClick={this.addReader}><Icon name="plus"/> Add</button> : null
            }
        </section>;
    }
});
