module.exports = function(reader, email) {
    return {
        verb: 'sent',
        what: [{
            article: 'an',
            type: 'email',
            title: email.title
        }],
        who: {
            name: email.from ? email.from.name : 'Unknown',
            url: email.from && 'mailto:' + email.from.address
        },
        whom: {
            name: reader.settings.address,
            isYou: true
        },
        when: email.date
    };
};
