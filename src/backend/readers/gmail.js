var email = require('./email');
var extend = require('extend');

module.exports = {
    type: 'gmail',
    image: 'http://upload.wikimedia.org/wikipedia/commons/thumb/4/45/New_Logo_Gmail.svg/1000px-New_Logo_Gmail.svg.png',
    description: 'Tracks your Gmail account',
    schema: {
        oauth2: {
            provider: 'google',
            strategy: require('passport-google-oauth').OAuth2Strategy,
            params: {
                scope: ['https://mail.google.com/', 'profile', 'email']
            },
            authParams: {
                approvalPrompt: 'force',
                accessType: 'offline'
            }
        }
    },
    tick: function(reader) {
        return email.tick(extend(true, {
            settings: {
                server: 'imap.gmail.com',
                address: reader.profile.emails[0].value
            }
        }, reader));
    }
};
