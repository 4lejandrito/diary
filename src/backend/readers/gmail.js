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
            }), emails, error;

            function finish(err, messages) {
                error = err;
                emails = messages;
                client.close();
            }

            client.on("connect", function() {
                client.openMailbox("INBOX", {readOnly: true}, function() {
                    db.get('events').findOne({
                        reader_id: reader.id
                    }, {
                        sort: {'source.UID': -1}
                    }).on('success', function (lastMessage) {
                        if (lastMessage) {
                            client.listMessagesByUID(
                                lastMessage.source.UID,
                                '*',
                                function(err, messages) {
                                    if (messages) messages.shift();
                                    finish(err, messages);
                                }
                            );
                        } else {
                            client.listMessages(0, finish);
                        }
                    }).on('error', finish);
                });
            });

            client.on('close', function() {
                if (emails && !error) {
                    resolve(emails.map(function(email) {
                        return {
                            date: email.date,
                            source_id: email.UID,
                            source: email
                        };
                    }));
                } else {
                    reject(error || 'Unexpected error');
                }
            });

            client.on('error', finish);

            client.connect();
        });
    }
};
