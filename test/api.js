require('test/helper');

var setup = require('exproose').setup;
var app = require('src/app');

describe("REST API", function () {

    var client = app.setup();

    describe.skip('/api', function() {
        // describe('/user', function() {
        //     describe('GET', function() {
        //         it('creates a new user through basic auth and returns it', function(done) {
        //             client.post('/api/user', {
        //                 username: 'alejandro@tardin.com',
        //                 password: '1234'
        //             }).on('complete', function(data) {
        //                 expect(data).to.include({
        //                     email: 'alejandro@tardin.com'
        //                 })//.and.not.to.have.property('password');
        //                 done();
        //             });
        //         });
        //     });
        // });
    });
});
