var React = require('react');
var Icon = require('components/icon');
var _ = require('underscore');

module.exports = React.createClass({
    getInitialState: function() {
        return {
            toggle: false,
            filteredList: []
        };
    },
    componentWillReceiveProps: function(nextProps) {
        if (nextProps.list !== this.props.list) {
            this.props = nextProps;
            this.filter();
        }
    },
    toggle: function() {
        this.setState({toggle: !this.state.toggle});
        this.props.onChange(this.props.list);
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
        if (this.state.toggle) {
            this.props.onChange(_.filter(this.props.list, function(element) {
                return this.containsTerm(element, this.refs.input.getDOMNode().value);
            }, this));
        }
    },
    stopPropagation: function(event) {
        event.stopPropagation();
    },
    render: function() {
        return <span className="search" data-toggle={this.state.toggle} onClick={this.toggle}>
            <Icon name={this.state.toggle ? 'arrow-left' : 'search'}/>
            {this.state.toggle && <input ref="input" onBlur={this.onBlur} onClick={this.stopPropagation} autoFocus={true} type="text" placeholder={this.props.placeholder} onChange={this.filter}/>}
        </span>;
    }
});
