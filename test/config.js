require('test/helper');

describe("config", function () {

    var config = require('exproose').config;

    describe('.readers: path to the readers folder', function() {
        it('is "test/sample/readers" in TEST', function () {
            expect(config.readers).to.eq('test/sample/readers');
        });
    });
});
