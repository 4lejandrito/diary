var imapClient = require('imap-client');

module.exports = {
  type: 'Gmail',
  image: 'http://icons.iconarchive.com/icons/martz90/circle/128/gmail-icon.png',
  description: 'Add your gmail to Diary',
    schema: {},
    instance: function(user, emit) {
        var interval;
        return {
            start: function() {
              var imap = new imapClient({
                port: 993,
                host: 'imap.gmail.com',
                secure: true,
                ignoreTLS: false,
                requireTLS: false,
                auth: {
                  user: 'matthewalnerdevtest@gmail.com',
                  pass: '1qazse4!'
                },
                maxUpdateSize: 20
              });
              imap.login(function() {
                console.log('ImapClient Reader Logged _IN_');
                interval = setInterval(function() {
                    emit(imap.listMessages({
                      path: "INBOX"
                    }, function(error, messages) {
                      return messages;
                    }));
                }, 600000);
              });
            },
            stop: function() {
              imap.logout(function() {
                clearInterval(interval);
                console.log('ImapClient Reader Logged _OUT_');
              });
            }
        };
    }
};
