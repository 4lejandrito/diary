var React = require('react');
var api = require('api');
var Loading = require('components/ui/loading');
var Icon = require('components/ui/icon');
var _ = require('underscore');
var ReaderImage = require('components/reader-image');
var Sticky = require('react-sticky');
var Content = require('components/ui/content');

module.exports = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },
    getInitialState: function() {
        return {};
    },
    getSettings: function() {
        return _.mapObject(this.refs, function(ref) {
            var value = ref.getDOMNode().value;
            return !isNaN(value) ? parseFloat(value) : value;
        });
    },
    addReader: function() {
        var self = this;
        if (this.state.reader.schema.oauth2) {
            window.location.replace('/auth/' + this.state.reader.type + '?' +
            _.pairs(this.getSettings()).map(function(pair) {
                return encodeURIComponent(pair[0]) + "=" + encodeURIComponent(pair[1]);
            }).join('&'));
        } else {
            api.addReader(this.state.reader.type, this.getSettings(), function() {
                self.context.router.transitionTo('/services');
            });
        }
    },
    componentWillMount: function() {
        var self = this;
        api.getAvailableReader(this.props.type, function(err, reader) {
            var length = Object.keys(reader.schema).length;
            if (length === 0 || (length === 1 && reader.schema.oauth2)) {
                self.state.reader = reader;
                self.addReader();
            } else {
                self.setState({reader: reader});
            }
        });
    },
    render: function() {
        return <article className="new-reader">
            <Sticky type={React.DOM.header}>
                <h2>{this.state.reader ? this.state.reader.type : '...'}</h2>
                <h3>{this.state.reader ? this.state.reader.description : '...'}</h3>
            </Sticky>
            <Content>
                {this.state.reader && <ReaderImage type={this.state.reader.type}/>}
                {
                    this.state.reader &&
                    _.mapObject(this.state.reader.schema, function(val, key) {
                        if (key != 'oauth2') {
                            return <div className="param">
                                <label>{val.description}</label>
                                <input type={val.type} ref={key} placeholder={val.example}/>
                            </div>;
                        }
                    })
                }
                {this.state.reader &&
                    <button onClick={this.addReader}><Icon name="plus"/> Add</button>
                }
                {!this.state.reader && <Loading/>}
            </Content>
        </article>;
    }
});
