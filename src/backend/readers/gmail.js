var inbox = require("inbox");
var db = require('../db');
var Promise = require('promise');

module.exports = {
    type: 'gmail',
    image: 'http://upload.wikimedia.org/wikipedia/commons/thumb/4/45/New_Logo_Gmail.svg/1000px-New_Logo_Gmail.svg.png',
    description: 'Tracks your Gmail account',
    schema: {
        address: {
            type: 'text',
            description: 'Your Gmail address',
            example: 'me@gmail.com'
        },
        oauth2: {
            provider: 'google',
            strategy: require('passport-google-oauth').OAuth2Strategy,
            params: {
                scope: ['https://mail.google.com/', 'profile']
            },
            authParams: {
                approvalPrompt: 'force',
                accessType: 'offline'
            }
        }
    },
    tick: function(reader) {
        return new Promise(function (resolve, reject) {
            var client = inbox.createConnection(false, "imap.gmail.com", {
                secureConnection: true,
                auth:{
                    XOAuth2: {
                        user: reader.settings.address,
                        accessToken: reader.token
                    }
                }
            });

            function emitMessages(messages) {
                if (messages && messages.length) {
                    resolve(messages.map(function(message) {
                        return {
                            date: message.date,
                            source_id: message.UID,
                            source: message
                        };
                    }));
                }
            }

            client.on("connect", function() {
                client.openMailbox("INBOX", {readOnly: true}, function() {
                    db.get('events').findOne({
                        reader_id: reader.id
                    }, {
                        sort: {'source.UID': -1}
                    }).on('success', function (lastMessage) {
                        if (lastMessage) {
                            client.listMessagesByUID(lastMessage.source.UID, '*', function(err, messages) {
                                if (messages) messages.shift();
                                emitMessages(messages);
                            });
                        } else {
                            client.listMessages(0, function(err, messages) {
                                emitMessages(messages);
                            });
                        }
                    });
                });
            });

            client.on('error', reject);

            client.connect();
        });
    }
};
