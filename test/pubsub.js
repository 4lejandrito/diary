require('test/helper');

describe("pubsub", function() {

    var pubsub = require('src/pubsub');

    it("is a singleton instance of EventEmmiter2", function() {
        expect(pubsub).to.be.instanceOf(require('eventemitter2').EventEmitter2);
    });

    it("supports wildcards with . as a separator", function(done) {
        pubsub.on('test.*', done);
        pubsub.emit('test.shit');
    });

    it("will pass the data as the first argument of the listener", function(done) {
        pubsub.on('test.*', function(data, name) {
            expect(data).to.deep.equal({
                some: 'data'
            });
            done();
        });
        pubsub.emit('test.shit', {some: 'data'});
    });
});
