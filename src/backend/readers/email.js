var inbox = require("inbox");
var db = require('../db');

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
    instance: function(emit, error) {
        var client, interval, reader = this;
        return {
            start: function() {
                client = inbox.createConnection(false, reader.settings.server, {
                    secureConnection: true,
                    auth: {
                        user: reader.settings.address,
                        pass: reader.settings.password
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
