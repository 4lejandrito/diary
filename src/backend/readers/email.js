var inbox = require("inbox");
var Promise = require('promise');
var extend = require('extend');
var Event = require('../models/event');

module.exports = {
    type: 'email',
    image: 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQbu7qdF0VAvO3exNZj7Aw6C5I0IVPlGRqX-b-Tt92WPcVQBrc7',
    description: 'Tracks your emails',
    schema: {
        server: {
            type: 'text',
            description: 'IMAP Server address',
            example: 'imap.google.com'
        },
        address: {
            type: 'text',
            description: 'Your email address',
            example: 'me@example.com'
        },
        password: {
            type: 'password',
            description: 'Your password'
        }
    },
    tick: function(reader) {
        return new Promise(function (resolve, reject) {
            var client = inbox.createConnection(false, reader.settings.server, {
                secureConnection: true,
                auth: extend({
                        user: reader.settings.address
                    }, reader.token ? {
                        XOAuth2: {
                            accessToken: reader.token
                        }
                    } : {
                        pass: reader.settings.password
                    })
            }), emails, error;

            function finish(err, messages) {
                error = err;
                emails = messages;
                client.close();
            }

            client.on("connect", function() {
                client.openMailbox("INBOX", {readOnly: true}, function() {
                    Event.collection.findOne({
                        reader_id: reader.id
                    }, {
                        sort: {'source.UID': -1}
                    }, function (err, lastMessage) {
                        if (lastMessage) {
                            client.listMessagesByUID(
                                lastMessage.source.UID,
                                '*',
                                function(err, messages) {
                                    if (messages) messages.shift();
                                    finish(err, messages);
                                }
                            );
                        } else if (err) {
                            finish(err);
                        } else {
                            client.listMessages(0, finish);
                        }
                    });
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
