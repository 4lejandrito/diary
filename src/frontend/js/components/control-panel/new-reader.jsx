var React = require('react');
var api = require('api');
var Loading = require('components/loading');
var Icon = require('components/icon');
var _ = require('underscore');
var ReaderImage = require('components/reader-image');
var Sticky = require('react-sticky');

module.exports = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },
    getInitialState: function() {
        return {};
    },
    addReader: function() {
        var self = this;
        api.addReader(this.state.reader.type, _.mapObject(this.refs, function(ref) {
            var value = ref.getDOMNode().value;
            return !isNaN(value) ? parseFloat(value) : value;
        }), function() {
            self.context.router.transitionTo('/services');
        });
    },
    componentWillMount: function() {
        var self = this;
        api.getAvailableReader(this.props.type, function(reader) {
            self.setState({reader: reader});
        });
    },
    render: function() {
        return <article className="new-reader">
            <Sticky type={React.DOM.header}>
                <h2>{this.state.reader ? this.state.reader.type : '...'}</h2>
                <h3>{this.state.reader ? this.state.reader.description : '...'}</h3>
            </Sticky>
            {this.state.reader && <ReaderImage type={this.state.reader.type}/>}
            {
                this.state.reader && this.state.reader.schema.oauth2 &&
                <a className="button" href={'/auth/' + this.state.reader.type}>
                    <Icon name="plus"/> Add
                </a>
            }
            {
                this.state.reader && !this.state.reader.schema.oauth2 &&
                _.mapObject(this.state.reader.schema, function(val, key) {
                    return <div className="param">
                        <label>{key}</label>
                        <input ref={key} defaultValue={val}/>
                    </div>;
                })
            }
            {this.state.reader && !this.state.reader.schema.oauth2 ?
                <button onClick={this.addReader}><Icon name="plus"/> Add</button> : null
            }
            {!this.state.reader && <Loading/>}
        </article>;
    }
});
