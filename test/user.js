require('test/helper');

describe("user", function () {

    var config = require('exproose').config;
    var User = require('src/user');

    it.skip('is a model', function() {
    });

    describe('.getReaders()', function() {
        it('returns an array with all the reader instances for the user', function() {
            var user = new User({
                email: 'me@example.com',
                readers: {
                    'type1': {}
                }
            });

            var readers = user.getReaders();
            expect(readers).to.be.an('array').with.length(1);
            expect(readers[0]).to.be.an.instanceOf(require(config.readers + '/reader1'));
            expect(readers[0].getUser()).to.eq(user);
        });
    });
});
