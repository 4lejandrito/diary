var chai = require('chai');
global.expect = chai.expect;
global.sinon = require('sinon').sandbox.create();
var sinonChai = require("sinon-chai");
chai.use(sinonChai);
chai.use(require('chai-as-promised'));

var pubsub = require('src/pubsub');

beforeEach(function() {
    sinon.restore();
    pubsub.removeAllListeners();
});
