var chai = require("chai");
chai.use(require("chai-as-promised"));
var expect = chai.expect;
var facebook = require('backend/readers/facebook');
var mongoose = require('mongoose');
var nock = require('nock');
var sinon = require('sinon').sandbox.create();

describe('facebook', function() {

    afterEach(function(done) {
        mongoose.connection.close(done);
        sinon.restore();
    });

    it('specifies the type "facebook"', function() {
        expect(facebook.type).to.eq('facebook');
    });

    it('has a nice description', function() {
        expect(facebook.description).to.eq('Tracks your Facebook account');
    });

    describe('authenticates via oauth2', function() {

        it('uses the facebook provider', function() {
            expect(facebook.schema.oauth2.provider).to.eq('facebook');
            expect(facebook.schema.oauth2.strategy).to.eq(
                require('passport-facebook').Strategy
            );
        });

        it('requests permissions for user profile (id, name, photo and email)', function() {
            expect(facebook.schema.oauth2.params.scope).to.include('user_about_me');
            expect(facebook.schema.oauth2.params.scope).to.include('email');
            expect(facebook.schema.oauth2.params.profileFields).to.deep.eq([
                'id', 'displayName', 'photos', 'email'
            ]);
        });

        it('requests permissions for user posts', function() {
            expect(facebook.schema.oauth2.params.scope).to.include('user_posts');
        });

        it('requests permissions for user photos', function() {
            expect(facebook.schema.oauth2.params.scope).to.include('user_photos');
        });
    });

    describe('#tick(reader)', function() {

        var api = nock('https://graph.facebook.com/v2.3/me');

        afterEach(function() {
            api.done();
        });

        it('returns a promise', function() {
            expect(facebook.tick({
                token: 'test-token'
            })).to.be.instanceOf(require('promise'));
        });

        describe('queries all the pages of the feed', function() {

            var feed = [{
                data: [{
                    id: '1',
                    created_time: '1989-12-09T08:00:00.0Z',
                    picture: 'pictureurl1',
                    message: 'text 1',
                    link: 'theurl1',
                }],
                paging: {
                    next: 'https://graph.facebook.com/v2.3/me/feed?page=2'
                }
            },{
                data: [{
                    id: '2',
                    created_time: '1989-12-09T08:00:01.0Z',
                    picture: 'pictureurl2',
                    caption: 'text 2',
                    link: 'theurl2',
                }],
                paging: {
                    next: 'https://graph.facebook.com/v2.3/me/feed?page=3'
                }
            },{
                data: [{
                    id: '3',
                    created_time: '1989-12-09T08:00:02.0Z',
                    picture: 'pictureurl3',
                    description: 'text 3',
                    link: 'theurl3'
                }]
            }];

            it('and resolves when they are all ok', function() {
                api
                .get('/feed?access_token=test-token&since=1')
                .reply(200, JSON.stringify(feed[0]))
                .get('/feed?page=2')
                .reply(200, JSON.stringify(feed[1]))
                .get('/feed?page=3')
                .reply(200, JSON.stringify(feed[2]));

                return expect(facebook.tick({
                    token: 'test-token'
                })).to.eventually.deep.equal([{
                    source_id: '1',
                    date: new Date('1989-12-09T08:00:00.0Z'),
                    url: 'theurl1',
                    description: 'text 1',
                    image: 'pictureurl1',
                    source: feed[0].data[0]
                },{
                    source_id: '2',
                    date: new Date('1989-12-09T08:00:01.0Z'),
                    url: 'theurl2',
                    description: 'text 2',
                    image: 'pictureurl2',
                    source: feed[1].data[0]
                },{
                    source_id: '3',
                    date: new Date('1989-12-09T08:00:02.0Z'),
                    url: 'theurl3',
                    description: 'text 3',
                    image: 'pictureurl3',
                    source: feed[2].data[0]
                }]);
            });

            it('and rejects when one of the calls fails', function() {
                api
                .get('/feed?access_token=test-token&since=1')
                .reply(200, JSON.stringify(feed[0]))
                .get('/feed?page=2')
                .reply(400, 'horrible');

                return expect(facebook.tick({
                    token: 'test-token'
                })).to.eventually.be.rejected;
            });
        });

        it('rejects if there is no token specified', function() {
            return expect(facebook.tick({})).to.eventually.be.rejected;
        });
    });
});
