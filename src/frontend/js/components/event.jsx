var React = require('react');
var Link = require('components/link');
var Icon = require('components/icon');
var Gravatar = require('react-gravatar');
var _ = require('underscore');
var pluralize = require('pluralize');

var Person = React.createClass({
    render: function() {
        var name = this.props.isYou ? 'you' : this.props.name;
        return this.props.url ? <Link href={this.props.url}>
            {name}
        </Link> : <span>{name}</span>;
    }
});

var WhatType = React.createClass({
    render: function() {
        if (this.props.type === 'person') return <Person {...this.props}/>;
        var name = this.props.type;
        if (this.props.name) name += ' ' + this.props.name;
        return <span>
            {this.props.article}{' '}
            {this.props.url ? <Link href={this.props.url}>
                {name}
            </Link> : name}
        </span>;
    }
});

var WhatList = React.createClass({
    render: function() {
        var groups = _.pairs(_.groupBy(this.props.what, 'type'));
        var pending = groups.length;
        return this.props.what.length > 1 ?
        <ul>
            {groups.map(function(pair) {
                var type = pair[0], whats = pair[1], el;
                if (whats.length === 1)
                    el = <WhatType {...pair[1][0]}/>;
                else
                    el = pluralize(type, whats.length, true);
                return <li>{el}{--pending === 0 ? '' : ' and '}</li>;
            })}
        </ul> : <WhatType {...this.props.what[0]}/>;
    }
});

var Complements = React.createClass({
    render: function() {
        return <ul>
            {this.props.complements.map(function(c) {
                return <li> {c.preposition} <WhatType {...c}/></li>;
            })}
        </ul>;
    }
});

var SemanticIcon = React.createClass({
    render: function() {
        switch(this.props.semantics.verb) {
            case 'watched': return <Icon name="youtube-play"/>;
            case 'added': return <Icon name="plus"/>;
            case 'created': return <Icon name="plus"/>;
            case 'deleted': return <Icon name="minus"/>;
            case 'pushed': return <Icon name="upload"/>;
            case 'published': return <Icon name="cloud-upload"/>;
            case 'shared': return <Icon name="share-alt"/>;
            case 'sent': return <Icon name="send"/>;
            default: return <Icon name="lightbulb-o"/>;
        }
    }
});

module.exports = React.createClass({
    render_link: function(link) {
        return <Link href={link.url} className="preview">
            {link.picture && <img src={link.picture}/>}
            <strong><small>{link.title}</small></strong>
            <small>{link.source}</small>
            <small>{link.text}</small>
        </Link>;
    },
    render_picture: function(picture) {
        return [
            <strong><small>{picture.title}</small></strong>,
            <small>{picture.text}</small>,
            <Link href={picture.url}>
                <div><img src={picture.picture}/></div>
            </Link>
        ];
    },
    render_video: function(video) {
        return [
            <small>{video.title}</small>,
            <div className="video">
                <img src={video.picture}/>
                <Link href={video.url} className="play">
                    <Icon name="youtube-play"/>
                </Link>
            </div>
        ];
    },
    render_commit: function(commit) {
        return [
            <Gravatar email={commit.source} size={50}/>,
            <Link href={commit.url}>
                <small>{commit.text}</small>
            </Link>
        ];
    },
    render_what: function(what) {
        var f = this['render_' + what.type];
        if (f) return f(what);
        return [
            what.title && <small>{what.title}</small>,
            what.text && <blockquote>{what.text}</blockquote>
        ];
    },
    render_where: function(where) {
        if (where) {
            var mapsUrl = 'http://maps.google.com/?q=', name = where.name;
            mapsUrl += where.coordinates[1] + ',' + where.coordinates[0];
            if (!name) name = where.city + ', ' + where.country;
            return <Link className="location" href={mapsUrl}>
                <small><Icon name="map-marker"/> {name}</small>
            </Link>;
        }
    },
    render: function() {
        var semantics = this.props.event.semantics;
        var what = semantics.what;
        return <div className="event">
            <header>
                <SemanticIcon semantics={semantics}/>{' '}
                <Person {...semantics.who}/>{' '}
                {semantics.verb}{' '}
                {semantics.whom && <Person {...semantics.whom}/>}{' '}
                <WhatList what={what}/>
                <Complements complements={semantics.complements}/>
            </header>
            <ul>
                {what.map(function(what) {
                    return <li className={what.type}>{this.render_what(what)}</li>;
                }.bind(this))}
            </ul>
            {this.render_where(semantics.where)}
        </div>;
    }
});
