var React = require('react');
var Icon = require('components/ui/icon');
var _ = require('underscore');
var Loading = require('components/ui/loading');

module.exports = React.createClass({
    getInitialState: function() {
        return {
            toggle: false
        };
    },
    componentWillReceiveProps: function(nextProps) {
        if (nextProps.source !== this.props.source) {
            this.props = nextProps;
            this.filter();
        }
    },
    toggle: function() {
        this.setState({toggle: !this.state.toggle});
        if (_.isArray(this.props.source)) {
            this.props.onResults(this.props.source);
        } else {
            this.props.onResults();
        }
    },
    onBlur: function() {
        if (!this.refs.input.getDOMNode().value) {
            this.toggle();
        }
    },
    containsTerm: function(object, term) {
        if (_.isString(object)) {
            return object.toLowerCase().indexOf(term.toLowerCase()) !== -1;
        } else if (_.isNumber(object)) {
            return ('' + object).toLowerCase().indexOf(term.toLowerCase()) !== -1;
        } else {
            return _.some(_.values(object), function(value) {
                return this.containsTerm(value, term);
            }, this);
        }
    },
    filter: function() {
        if (this.state.toggle && this.props.source) {
            var value = this.refs.input.getDOMNode().value;
            if (_.isArray(this.props.source)) {
                this.props.onResults(_.filter(this.props.source, function(element) {
                    return this.containsTerm(element, value);
                }, this));
            } else if (_.isFunction(this.props.source)) {
                if (this.state.request) this.state.request.abort();
                if (!value) return this.props.onResults();
                this.setState({
                    loading: true,
                    request: this.props.source(value, function(err, data) {
                        this.props.onResults(data);
                        this.setState({loading: false});
                    }.bind(this))
                });
            }
        }
    },
    render: function() {
        return <span className="search" data-toggle={this.state.toggle} onClick={this.toggle}>
            <Icon name={this.state.toggle ? 'arrow-left' : 'search'}/>
            {this.state.toggle && <input
                ref="input"
                onBlur={this.onBlur}
                onClick={function(e) {e.stopPropagation();}}
                autoFocus={true}
                type="text"
                placeholder={this.props.placeholder}
                onChange={_.debounce(this.filter, 200)}
            />}
            {this.state.loading && <Loading/>}
        </span>;
    }
});
