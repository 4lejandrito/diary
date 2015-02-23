require('test/helper');

var pubsub = require('src/pubsub');
var User = require('src/user');
var EventEmitter = require('eventemitter2').EventEmmiter2;
var config = require('exproose').config;

describe("reader", function () {

    var reader = require('src/reader');
    var TestReader = reader('type0');

    it('is a function', function() {
        expect(reader).to.be.a('function');
    });

    describe('reader(type)', function() {

        it("returns a reader subclass for the given type", function () {
            expect(new TestReader())
            .to.be.instanceOf(TestReader)
            .and
            .to.be.instanceOf(reader.Reader);
            expect(TestReader).to.have.property('type', 'type0');
        });

        describe('new SubClass()', function() {

            var unit = new TestReader();

            it("creates an instance of the reader", function () {
            });

            describe('instance', function() {
                describe('.constructor', function() {
                    it("is the subclass", function () {
                        expect(unit.constructor).to.eq(TestReader);
                    });
                });
                describe('.getType()', function() {
                    it("returns the type of the reader", function () {
                        expect(unit.getType()).to.eq('type0');
                    });
                });

                describe('.getUsers()', function() {

                    require('exproose').setup();

                    it("returns a promise for all the users using the reader", function () {
                        return expect(unit.getUsers())
                        .to.eventually.have.length(1)
                        .and.satisfy(function(readers) {
                            return readers[0].equals(new User({
                                _id: readers[0]._id,
                                name: 'Name2',
                                email: '2@example.com',
                                readers: {
                                    'type0': {}
                                }
                            }));
                        });
                    });
                });

                describe('.emit(user, event)', function() {
                    it("publishes an event and user through 'event.{{type}}'", function (done) {
                        var event = { some: 'event'};
                        var user = { user: 'name'};

                        pubsub.on('event.type0', function(data) {
                            expect(data.event).to.deep.eq({
                                type: 'type0',
                                some: 'event'
                            });
                            expect(data.user).to.eq(user);
                            done();
                        });

                        unit.emit(user, event);
                    });
                });

                describe('.stop()', function() {
                    it("is meant to stop the reader", function() {
                        expect(TestReader.prototype.stop).to.be.a('function');
                    });
                });
            });
        });
    });

    describe('reader.all()', function() {
        it('returns all the reader classes in the "config.readers" path', function() {
            expect(reader.all()).to.be.an('array')
            .with.length(2)
            .and.include(require(config.readers + '/reader1'))
            .and.include(require(config.readers + '/reader2'));
        });

        it('will load them once and cache them for performance', function() {
            expect(reader.all()).to.eq(reader.all());
        });
    });

    describe('reader.forType(type)', function() {
        it('returns the reader class for the given type', function() {
            expect(reader.forType('type1')).to.eq(require(config.readers + '/reader1'));
            expect(reader.forType('type2')).to.eq(require(config.readers + '/reader2'));
        });

        it('returns undefined if no reader is found', function() {
            expect(reader.forType('test3')).to.eq(undefined);
        });
    });
});
