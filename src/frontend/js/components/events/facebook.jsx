var React = require('react');
var Link = require('components/link');

var Person = React.createClass({
    render: function() {
        return <Link href={'http://facebook.com/app_scoped_user_id/' + this.props.id}>
            {this.props.name}
        </Link>;
    }
});

module.exports = React.createClass({
    render_link: function(post) {
        return <div>
            <header>
                <img src={post.icon}/> <Person {...post.from}/> shared a link with you
            </header>
            <Link href={post.link} className="preview">
                <img src={post.picture}/>
                <strong><small>{post.name}</small></strong>
                <small>{post.caption}</small>
                <small>{post.description}</small>
            </Link>
        </div>;
    },
    render_status: function(post) {
        //enum{mobile_status_update, created_note, added_photos, added_video, shared_story, created_group, created_event, app_created_story, published_story, tagged_in_photo, approved_friend}
        var content = 'You changed your status';
        if (post.status_type === 'wall_post') {
            content = [<Person {...post.from}/>, ' published on your wall'];
        }
        return <div>
            <header>
                {content}
            </header>
            {post.message}
        </div>;
    },
    render_photo: function(post) {
        return <div>
            <header>
                <img src={post.icon}/> <Person {...post.from}/> shared a picture with you
            </header>
            <Link href={post.link}>
                <div><img src={post.picture}/></div>
            </Link>
        </div>;
    },
    render_video: function(post) {
        return <div>
            <header>
                <img src={post.icon}/> <Person {...post.from}/> shared a video with you
            </header>
            <small>{post.caption}</small>
            <iframe src={post.source.replace('autoplay=1', '')}/>
        </div>;
    },
    render: function() {
        var post = this.props.event.source;
        return this['render_' + post.type](post) || <b>{post.type}</b>;
    }
});
