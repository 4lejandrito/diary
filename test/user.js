require('test/helper');

var User = require('src/user');
var config = require('exproose').config;
var extend = require('extend');

describe("user", function () {

    var createUser;
    beforeEach(function() {
        var schema = {methods: {}, add: sinon.spy()};
        User(schema);
        createUser = function(user) {
            return extend(true, {
                save: sinon.stub(),
                readers: {}
            }, user, schema.methods);
        };
    });

    it('is a mongoose plugin for the user model', function() {
        expect(User).to.be.a('function');
    });

    it('adds the readers property to the schema', function() {
        var schema = {methods: {}, add: sinon.spy()};
        User(schema);
        expect(schema.add).to.have.been.calledWith({
            readers: {type: Object, default: {}}
        });
    });

    describe('.getReaders()', function() {
        it('returns an array with all the reader instances for the user', function() {
            var user = createUser({
                readers: {
                    'type1': {}
                }
            });

            var readers = user.getReaders();
            expect(readers).to.be.an('array').with.length(1);
            expect(readers[0]).to.be.an.instanceOf(require(config.readers + '/reader1'));
            expect(readers[0].getUser()).to.eq(user);
        });

        it('will cache the results by the _id property', function() {
            var userA = createUser({_id: '1', readers: {'type1': {}}});
            var userB = createUser({_id: '1', readers: {'type1': {}}});
            var userC = createUser({_id: '2', readers: {'type1': {}}});

            expect(userA.getReaders())
            .to.eq(userB.getReaders())
            .and.not
            .to.eq(userC.getReaders());
        });
    });

    describe('.addReader(type, config)', function() {
        it('creates a reader and adds it to the user', function() {
            var user = createUser();

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
            var user = createUser();

            user.addReader('type1', {some: 'config'});

            expect(user.save).to.have.been.called;
        });

        it('does not fail when the reader does not exist', function() {
            var user = createUser();

            expect(user.getReaders()).to.be.an('array').with.length(0);
            user.addReader('type-1', {some: 'config'});
            expect(user.getReaders()).to.be.an('array').with.length(0);
            expect(user.readers).to.deep.eq({});
        });
    });

    describe('startReaders()', function() {
        it('calls start in all the readers', function() {
            var user = createUser();
            sinon.stub(user, 'getReaders').returns([
                {start: sinon.stub()},
                {start: sinon.stub()}
            ]);

            user.startReaders();

            expect(user.getReaders()[0].start).to.have.been.calledOnce;
            expect(user.getReaders()[1].start).to.have.been.calledOnce;
        });
    });
});
