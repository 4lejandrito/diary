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
        var client;
        return {
            start: function() {
                client = inbox.createConnection(false, settings.server, {
                    secureConnection: true,
                    auth:{
                        user: settings.address,
                        pass: settings.password
                    }
                });

                client.on("connect", function() {
                    client.openMailbox("INBOX", function(error, info) {
                        client.listMessages(0, {readOnly: true}, function(err, messages) {
                            messages.forEach(emit);
                        });
                    });
                });

                client.on('new', emit);
                client.connect();
            },
            stop: function() {
                client.close();
            }
        };
    }
};
