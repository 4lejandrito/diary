var inbox = require("inbox");

module.exports = {
    type: 'email',
    image: 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQbu7qdF0VAvO3exNZj7Aw6C5I0IVPlGRqX-b-Tt92WPcVQBrc7',
    description: 'Tracks your emails',
    schema: {
        server: 'imap.gmail.com',
        address: 'me@example.com',
        password: ''
    },
    instance: function(emit, settings) {
        var client, lastMessage, interval;
        return {
            start: function() {
                client = inbox.createConnection(false, settings.server, {
                    secureConnection: true,
                    auth: {
                        user: settings.address,
                        pass: settings.password
                    }
                });

                function emitMessages(messages) {
                    if (messages && messages.length) {
                        messages.forEach(emit);
                        lastMessage = messages[messages.length - 1];
                    }
                }

                client.on("connect", function() {
                    interval = setInterval(function() {
                        client.openMailbox("INBOX", {readOnly: true}, function() {
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
                    }, 5000);
                });

                client.connect();
            },
            stop: function() {
                client.close();
            }
        };
    }
};
