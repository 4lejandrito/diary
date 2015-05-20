var React = require('react');
var Icon = require('components/icon');
var Link = require('components/link');
var Gravatar = require('react-gravatar');
var ghURL = 'https://github.com/';

module.exports = React.createClass({
    render_PullRequestEvent: function(ghEvent) {
        var pullRequest = ghEvent.payload.pull_request;
        return <div>
            <header>
                <Icon name="upload"/>{' '}
                You {ghEvent.payload.action} the pull request <Link href={pullRequest.html_url}>
                    #{pullRequest.number} {pullRequest.title}
                </Link> on <Link href={ghURL + ghEvent.repo.name}>
                    {ghEvent.repo.name}
                </Link>
            </header>
            <blockquote>
                <small>{pullRequest.body}</small>
            </blockquote>
        </div>;
    },
    render_ReleaseEvent: function(ghEvent) {
        var release = ghEvent.payload.release;
        return <div>
            <header>
                <Icon name="upload"/>{' '}
                You {ghEvent.payload.action} the version{' '}
                <Link href={release.html_url}>{release.tag_name}</Link>
                {' '} of <Link href={ghURL + ghEvent.repo.name}>
                    {ghEvent.repo.name}
                </Link>
            </header>
        </div>;
    },
    render_DeleteEvent: function(ghEvent) {
        return <div>
            <header>
                <Icon name="minus"/>{' '}
                You deleted a {ghEvent.payload.ref_type}
                {' '}({ghEvent.payload.ref}){' '}
                on <Link href={ghURL + ghEvent.repo.name}>
                    {ghEvent.repo.name}
                </Link>
            </header>
        </div>;
    },
    render_CreateEvent: function(ghEvent) {
        return <div>
            <header>
                <Icon name="plus"/>{' '}
                You created a {ghEvent.payload.ref_type}
                {' '}({ghEvent.payload.ref}){' '}
                on <Link href={ghURL + ghEvent.repo.name}>
                    {ghEvent.repo.name}
                </Link>
            </header>
        </div>;
    },
    render_IssueCommentEvent: function(ghEvent) {
        var issue = ghEvent.payload.issue;
        var comment = ghEvent.payload.comment;
        return <div>
            <header>
                <Icon name="comment"/>{' '}
                You commented the issue <Link href={issue.html_url}>
                    #{issue.number} {issue.title}
                </Link> on <Link href={ghURL + ghEvent.repo.name}>
                    {ghEvent.repo.name}
                </Link>
            </header>
            <blockquote>
                <small>{comment.body}</small>
            </blockquote>
        </div>;
    },
    render_IssuesEvent: function(ghEvent) {
        var issue = ghEvent.payload.issue;
        return <div>
            <header>
                <Icon name="comment"/>{' '}
                You {ghEvent.payload.action} the issue <Link href={issue.html_url}>
                    #{issue.number} {issue.title}
                </Link> on <Link href={ghURL + ghEvent.repo.name}>
                    {ghEvent.repo.name}
                </Link>
            </header>
        </div>;
    },
    render_MemberEvent: function(ghEvent) {
        var member = ghEvent.payload.member;
        return <div>
            <header>
                <Icon name="user"/>{' '}
                You {ghEvent.payload.action} <Link href={member.html_url}>
                    {member.login}
                </Link> on <Link href={ghURL + ghEvent.repo.name}>
                    {ghEvent.repo.name}
                </Link>
            </header>
        </div>;
    },
    render_PushEvent: function(ghEvent) {
        return <div>
            <header>
                <Icon name="code"/>{' '}
                You pushed to <Link href={ghURL + ghEvent.repo.name}>
                    {ghEvent.repo.name}
                </Link>
            </header>
             <ul>
                 {ghEvent.payload.commits.map(function(commit) {
                     return <li>
                         <Gravatar email={commit.author.email} size={50}/>
                         <Link href={ghURL + ghEvent.repo.name + '/commit/' + commit.sha}>
                             <small>{commit.message}</small>
                         </Link>
                     </li>;
                 })}
             </ul>
        </div>;
    },
    render: function() {
        var ghEvent = this.props.event.source;
        var renderer = this['render_' + ghEvent.type];
        if (renderer) {
            return renderer(ghEvent);
        } else {
            return <div>
                <i>{ghEvent.type}</i> is not yet supported
            </div>;
        }
    }
});
