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
    toggle: function() {
        this.setState({toggle: !this.state.toggle});
        this.props.onChange(this.props.list);
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
    filter: function(event) {
        this.props.onChange(_.filter(this.props.list, function(element) {
            return this.containsTerm(element, event.target.value);
        }, this));
    },
    stopPropagation: function(event) {
        event.stopPropagation();
    },
    render: function() {
        return <span className="search" data-toggle={this.state.toggle} onClick={this.toggle}>
            <Icon name="search"/>
            {this.state.toggle && <input onClick={this.stopPropagation} autoFocus={true} type="text" placeholder={this.props.placeholder} onChange={this.filter}/>}
        </span>;
    }
});
