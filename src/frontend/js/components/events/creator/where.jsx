var React = require('react');
var _ = require('underscore');
var Button = require('components/ui/button');

module.exports = React.createClass({
    getInitialState: function() {
        return {where: this.props.where || {}};
    },
    componentDidMount: function() {
        var autocomplete = new google.maps.places.Autocomplete(
            this.refs.search.getDOMNode()
        );
        google.maps.event.addListener(autocomplete, 'place_changed', function() {
            this.onChange(autocomplete.getPlace());
        }.bind(this));
    },
    getCurrentLocation: function() {
        navigator.geolocation.getCurrentPosition(function(pos) {
            new google.maps.Geocoder().geocode({
                latLng: new google.maps.LatLng(pos.coords.latitude,pos.coords.longitude)
            }, function(results) {
                this.onChange(results[0]);
            }.bind(this));
        }.bind(this));
        this.onChange();
        this.setState({loading: true});
    },
    onChange: function(place) {
        this.setState({
            loading: false,
            where: place ? {
                name: place.name || this.findComponent(place, 'route') || this.findComponent(place, 'locality'),
                coordinates: [place.geometry.location.lng(), place.geometry.location.lat()],
                country: this.findComponent(place, 'country'),
                city: this.findComponent(place, 'locality'),
                zip: this.findComponent(place, 'postal_code')
            } : {}
        }, this.onSubmit);
    },
    findComponent: function(result, type) {
        var component = _.find(result.address_components, function(component) {
            return _.include(component.types, type);
        });
        return component && component.short_name;
    },
    onSubmit: function() {
        this.props.onChange({
            where: this.state.where
        });
    },
    render: function() {
        return <div className="where">
            <header>
                Where {this.props.who.name}
                {' '}
                {this.props.verb}
                {' '}
                {this.props.what[0].article}
                {' '}
                {this.props.what[0].type}
                ?
            </header>
            <div className="location">
                <input
                    ref='search'
                    autoFocus={true}
                    placeholder="find a place"
                    value={this.state.where.name}
                    onChange={function() {this.onChange();}.bind(this)}
                    disabled={this.state.loading}
                />
                {navigator.geolocation &&
                <Button
                    loading={this.state.loading}
                    icon="location-arrow"
                    type="button"
                    onClick={this.getCurrentLocation}/>}
            </div>
            <div><small>Examples: <i>Madrid, Spain, UK...</i></small></div>
        </div>;
    }
});
