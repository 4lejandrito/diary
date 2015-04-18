var inbox = require("inbox");
var db = require('../db');
var config = require('config');

module.exports = {
    type: 'gmail',
    image: 'http://upload.wikimedia.org/wikipedia/commons/thumb/4/45/New_Logo_Gmail.svg/1000px-New_Logo_Gmail.svg.png',
    description: 'Tracks your Gmail account',
    schema: {
        address: 'Your Gmail address',
        oauth2: {
            authorizationURL: 'https://accounts.google.com/o/oauth2/auth',
            tokenURL: 'https://accounts.google.com/o/oauth2/token',
            clientID: config.gmail.clientID,
            clientSecret: config.gmail.clientSecret,
            scope: 'https://mail.google.com/'
        }
    },
    instance: function(emit, error) {
        var client, interval, reader = this;
        return {
            start: function() {
                client = inbox.createConnection(false, "imap.gmail.com", {
                    secureConnection: true,
                    auth:{
                        XOAuth2: {
                            user: reader.settings.address,
                            clientId: module.exports.schema.oauth2.clientID,
                            clientSecret: module.exports.schema.oauth2.clientSecret,
                            accessToken: reader.settings.token
                        }
                    }
                });

                function emitMessages(messages) {
                    if (messages && messages.length) {
                        messages.forEach(emit);
                    }
                }

                client.on("connect", function() {
                    interval = setInterval(function() {
                        client.openMailbox("INBOX", {readOnly: true}, function() {
                            db.get('events').findOne({
                                reader_id: reader.id
                            }, {
                                sort: {UID: -1}
                            }).on('success', function (lastMessage) {
                                if (lastMessage) {
                                    client.listMessagesByUID(lastMessage.UID, '*', function(err, messages) {
                                        messages.shift();
                                        emitMessages(messages);
                                    });
                                } else {
                                    client.listMessages(0, function(err, messages) {
                                        emitMessages(messages);
                                    });
                                }
                            });
                        });
                    }, 5000);
                });

                client.on('error', error);

                client.connect();
            },
            stop: function() {
                client.close();
            }
        };
    }
};
