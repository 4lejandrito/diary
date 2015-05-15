var React = require('react');
var Icon = require('components/icon');
var Link = require('components/link');
var Gravatar = require('react-gravatar');

module.exports = React.createClass({
    render: function() {
        return <div>
            <header>
                <Icon name="envelope"/>{' '}
                You received an email from <Link href={'mailto:' + this.props.event.source.from.address}>
                    {this.props.event.source.from.name}
                </Link>
            </header>
            <small>{this.props.event.source.title}</small>
        </div>;
    }
});
