var chai = require("chai");
chai.use(require("chai-as-promised"));
var expect = chai.expect;
var github = require('backend/readers/github');
var db = require('backend/db');
var nock = require('nock');

describe('github', function() {

    afterEach(function(done) {
        db.close(done);
    });

    it('specifies the type "github"', function() {
        expect(github.type).to.eq('github');
    });

    it('has a nice description', function() {
        expect(github.description).to.eq('Tracks your github commits');
    });

    describe('authenticates via oauth2', function() {

        it('uses the github provider', function() {
            expect(github.schema.oauth2.provider).to.eq('github');
            expect(github.schema.oauth2.strategy).to.eq(
                require('passport-github').Strategy
            );
        });

        it('requests permissions for user repositories', function() {
            expect(github.schema.oauth2.params.scope).to.eq('repo');
        });
    });

    describe('#tick(reader)', function() {

        var api = nock('https://api.github.com');

        afterEach(function() {
            api.done();
        });

        it('returns a promise', function() {
            expect(github.tick({
                token: 'test-token',
                profile: {username: '4lejandrito'}
            })).to.be.instanceOf(require('promise'));
        });

        describe('queries the 3 pages of events', function() {

            var githubEvents = [{
                id: '1',
                created_at: '1989-12-09T08:00:00.0Z',
                someotherstuff: '1'
            },{
                id: '2',
                created_at: '1989-12-09T08:00:01.0Z',
                someotherstuff: '2'
            },{
                id: '3',
                created_at: '1989-12-09T08:00:02.0Z',
                someotherstuff: '3'
            }];

            it('and resolves when they are all ok', function() {
                api
                .get('/users/4lejandrito/events?page=1&per_page=100&access_token=test-token')
                .reply(200, [githubEvents[0]])
                .get('/users/4lejandrito/events?page=2&per_page=100&access_token=test-token')
                .reply(200, [githubEvents[1]])
                .get('/users/4lejandrito/events?page=3&per_page=100&access_token=test-token')
                .reply(200, [githubEvents[2]]);

                return expect(github.tick({
                    token: 'test-token',
                    profile: {username: '4lejandrito'}
                })).to.eventually.deep.equal([{
                    date: new Date('1989-12-09T08:00:00.0Z'),
                    source_id: '1',
                    source: githubEvents[0]
                },{
                    date: new Date('1989-12-09T08:00:01.0Z'),
                    source_id: '2',
                    source: githubEvents[1]
                },{
                    date: new Date('1989-12-09T08:00:02.0Z'),
                    source_id: '3',
                    source: githubEvents[2]
                }]);
            });

            it('and rejects when one of the calls fails', function() {
                api
                .get('/users/4lejandrito/events?page=1&per_page=100&access_token=test-token')
                .reply(200, [githubEvents[0]])
                .get('/users/4lejandrito/events?page=2&per_page=100&access_token=test-token')
                .reply(400, 'Horrible')
                .get('/users/4lejandrito/events?page=3&per_page=100&access_token=test-token')
                .reply(200, [githubEvents[1]]);

                return expect(github.tick({
                    token: 'test-token',
                    profile: {username: '4lejandrito'}
                })).to.eventually.be.rejected;
            });
        });

        it('rejects if there is no token specified', function() {
            return expect(github.tick({
                profile: {username: '4lejandrito'}
            })).to.eventually.be.rejected;
        });
    });
});
