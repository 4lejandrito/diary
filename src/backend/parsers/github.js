var extend = require('extend');
var ghURL = 'https://github.com/';

module.exports = function(reader, event) {
    return {
        verb: verb(event),
        what: what(reader.profile, event),
        complements: complements(event),
        who: who(reader.profile, event),
        when: when(event)
    };
};

function issue(event) {
    return {
        article: 'the',
        type: 'issue',
        url: event.payload.issue.html_url,
        name: '#' + event.payload.issue.number,
        title: event.payload.issue.title,
        text: event.payload.issue.body
    };
}

function comment(event) {
    return {
        type: 'comment',
        url: event.payload.comment.html_url,
        text: event.payload.comment.body
    };
}

function repo(r) {
    return {
        article: 'the',
        type: 'repository',
        name: r.full_name || r.name,
        url: ghURL + (r.full_name || r.name)
    };
}

function verb(event) {
    if (event.payload && event.payload.action) {
        return event.payload.action;
    }
    switch(event.type) {
        case 'DeleteEvent': return 'deleted';
        case 'CreateEvent': return 'created';
        case 'PushEvent': return 'pushed';
        case 'CommitCommentEvent': return 'created';
        case 'ForkEvent': return 'forked';
        default: return event.type;
    }
}

function what(profile, event) {
    switch(event.type) {
        case 'PullRequestEvent': return [{
            article: 'the',
            type: 'pull request',
            url: event.payload.pull_request.html_url,
            name: '#' + event.payload.pull_request.number,
            title: event.payload.pull_request.title,
            text: event.payload.pull_request.body
        }];
        case 'ReleaseEvent': return [{
            article: 'the',
            type: 'release',
            url: event.payload.release.html_url,
            name: event.payload.release.tag_name
        }];
        case 'DeleteEvent': return [{
            type: event.payload.ref_type,
            name: event.payload.ref
        }];
        case 'CreateEvent': return [{
            article: 'the',
            type: event.payload.ref_type,
            name: event.payload.ref
        }];
        case 'ForkEvent': return [repo(event.payload.forkee)];
        case 'IssueCommentEvent': return [comment(event)];
        case 'CommitCommentEvent': return [comment(event)];
        case 'IssuesEvent': return [issue(event)];
        case 'MemberEvent': return [{
            type: 'person',
            name: event.payload.member.login,
            url: ghURL + event.payload.member.login,
            isYou: profile.id === event.payload.member.id
        }];
        case 'PushEvent': return event.payload.commits.map(function(c) {
            return {
                type: 'commit',
                source: c.author.email,
                url: ghURL + event.repo.name + '/commit/' + c.sha,
                text: c.message
            };
        });
    }
}

function complements(event) {
    var list = [];
    if (event.type === 'IssueCommentEvent') {
        list.push(extend(issue(event), {
            preposition: 'for'
        }));
    }
    if (event.type === 'CommitCommentEvent') {
        list.push({
            preposition: 'for',
            article: 'the',
            type: 'commit',
            name: event.payload.comment.commit_id.substring(0, 8),
            url: ghURL + event.repo.name + '/commit/' + event.payload.comment.commit_id
        });
    }
    if (event.repo) {
        var preposition = 'in';
        if (event.type === 'PushEvent') preposition = 'to';
        if (event.type === 'ForkEvent') preposition = 'from';
        list.push(extend(repo(event.repo), {
            preposition: preposition
        }));
    }
    return list;
}

function who(profile, event) {
    return event.actor && {
        type: 'person',
        name: event.actor.login,
        url: ghURL + event.actor.login,
        isYou: profile.id === event.actor.id
    };
}

function when(event) {
    return new Date(event.created_at);
}
