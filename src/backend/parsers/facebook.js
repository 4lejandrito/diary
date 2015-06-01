var extend = require('extend');

module.exports = function(reader, post) {
    return {
        verb: verb(post),
        what: what(post),
        who: who(reader.profile, post),
        whom: whom(reader.profile, post),
        where: where(post),
        when: when(post),
        complements: complements(reader.profile, post)
    };
};

var fbUrl = '//www.facebook.com/';

function verb(post) {
    if (post.type === 'status' ) {
        if (post.status_type === 'wall_post')
            return 'posted';
        else return 'changed';
    } else return 'shared';
}

function what(post) {
    switch(post.type) {
        case 'link': return [{
            type: 'link',
            url: post.link,
            picture: post.picture,
            source: post.caption,
            title: post.name,
            text: post.description
        }];
        case 'status': return [{
            type: post.status_type === 'wall_post' ? 'message' : 'status',
            article: post.status_type === 'wall_post' ? 'a' : 'the',
            text: post.message,
            url: fbUrl + post.id
        }];
        case 'photo': return [{
            type: 'picture',
            url: post.link,
            picture: post.picture,
            text: post.message
        }];
        case 'video': return [{
            type: 'video',
            url: post.link,
            picture: post.picture,
            title: post.name,
            text: post.description
        }];
    }
}

function person(profile, data) {
    return {
        type: 'person',
        name: data.name,
        url: 'http://facebook.com/app_scoped_user_id/' + data.id,
        isYou: profile.id === data.id
    };
}

function complements(profile, post) {
    var list = [];
    if (post.with_tags) {
        post.with_tags.data.map(function(data) {
            var p = extend(person(profile, data), {
                preposition: 'with'
            });
            if (p.isYou) list.push(p);
        });
    }
    if (post.status_type === 'wall_post') {
        list.push({
            preposition: 'on',
            article: 'your',
            type: 'wall'
        });
    }
    return list;
}

function who(profile, post) {
    return post.from && person(profile, post.from);
}

function whom(profile, post) {
    return post.to && person(profile, post.to.data[0]);
}

function where(post) {
    return post.place && {
        name: post.place.name,
        city: post.place.location.city,
        country: post.place.location.country,
        zip: post.place.location.zip,
        coordinates: [
            post.place.location.longitude,
            post.place.location.latitude
        ]
    };
}

function when(post) {
    return post.created_time;
}
