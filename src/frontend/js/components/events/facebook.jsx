var React = require('react');
var Link = require('components/link');
var Icon = require('components/icon');

var Person = React.createClass({
    render: function() {
        return <Link href={'http://facebook.com/app_scoped_user_id/' + this.props.id}>
            {this.props.name}
        </Link>;
    }
});

module.exports = React.createClass({
    render_link: function(post) {
        return <div className="event">
            <header>
                <img src={post.icon}/> <Person {...post.from}/> shared a link with you:
            </header>
            <Link href={post.link} className="preview">
                {post.picture && <img src={post.picture}/>}
                <strong><small>{post.name || post.caption || '????'}</small></strong>
                {post.caption && <small>{post.caption}</small>}
                {post.description && <small>{post.description}</small>}
            </Link>
        </div>;
    },
    render_status: function(post) {
        //enum{mobile_status_update, created_note, added_photos, added_video, shared_story, created_group, created_event, app_created_story, published_story, tagged_in_photo, approved_friend}
        var content = 'You changed your status:';
        if (post.status_type === 'wall_post') {
            content = [<Person {...post.from}/>, ' published on your wall:'];
        }
        return <div className="event">
            <header>
                {content}
            </header>
            <blockquote>
                <small>{post.message || '????'}</small>
            </blockquote>
        </div>;
    },
    render_photo: function(post) {
        return <div className="event">
            <header>
                <img src={post.icon}/> <Person {...post.from}/> shared a picture with you:
            </header>
            <Link href={post.link}>
                <div><img src={post.picture}/></div>
            </Link>
        </div>;
    },
    render_video: function(post) {
        return <div className="event">
            <header>
                <img src={post.icon}/> <Person {...post.from}/> shared a video with you:
            </header>
            <small>{post.name}</small>
            <div className="video">
                <img src={post.picture}/>
                <Link href={post.link} className="play">
                    <Icon name="youtube-play"/>
                </Link>
            </div>
        </div>;
    },
    render: function() {
        var post = this.props.event.source;
        return this['render_' + post.type](post) || <b>{post.type}</b>;
    }
});
