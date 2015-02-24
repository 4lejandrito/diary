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

        it('will cache the results', function() {
            var userA = new User({
                email: 'me@example.com',
                readers: {
                    'type1': {}
                }
            });

            var userB = new User({
                _id: userA._id,
                email: 'me@example.com',
                readers: {
                    'type1': {}
                }
            });

            expect(userA.getReaders()).to.eq(userB.getReaders());
        });
    });

    describe('.addReader(type, config)', function() {
        it('creates a reader and adds it to the user', function() {
            var user = new User({
                email: 'me@example.com'
            });

            expect(user.getReaders()).to.be.an('array').with.length(0);
            user.addReader('type1', {some: 'config'});
            var readers = user.getReaders();
            expect(readers).to.be.an('array').with.length(1);
            expect(readers[0]).to.be.an.instanceOf(require(config.readers + '/reader1'));
            expect(readers[0].getUser()).to.eq(user);
            expect(user.readers).to.deep.eq({
                type1: {
                    some: 'config'
                }
            });
        });

        it('updates the user in the database', function() {
            var user = new User({
                email: 'me@example.com'
            });

            sinon.stub(user, 'save');

            user.addReader('type1', {some: 'config'});

            expect(user.save).to.have.been.called;
        });

        it('does not fail when the reader does not exist', function() {
            var user = new User({
                email: 'me@example.com'
            });

            expect(user.getReaders()).to.be.an('array').with.length(0);
            user.addReader('type-1', {some: 'config'});
            expect(user.getReaders()).to.be.an('array').with.length(0);
            expect(user.readers).to.deep.eq({});
        });
    });
});
