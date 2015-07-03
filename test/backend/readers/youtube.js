var chai = require("chai");
chai.use(require("chai-as-promised"));
var expect = chai.expect;
var youtube = require('backend/readers/youtube');
var mongoose = require('mongoose');
var nock = require('nock');

describe('Youtube', function() {

    afterEach(function(done) {
        mongoose.connection.close(done);
    });

    it('specifies the type "youtube"', function() {
        expect(youtube.type).to.eq('youtube');
    });

    it('has a nice description', function() {
        expect(youtube.description).to.eq('Tracks your Youtube watch history');
    });

    describe('authenticates via oauth2', function() {

        it('uses the google provider', function() {
            expect(youtube.schema.oauth2.provider).to.eq('google');
            expect(youtube.schema.oauth2.strategy).to.eq(
                require('passport-google-oauth').OAuth2Strategy
            );
        });

        it('specifies the youtube and profile scopes', function() {
            expect(youtube.schema.oauth2.params.scope).to.deep.eq([
                'https://gdata.youtube.com',
                'profile'
            ]);
        });

        it('asks for offline access to get the refresh token', function() {
            expect(youtube.schema.oauth2.authParams.accessType).to.eq('offline');
        });

        it('forces the authentication prompt to be always displayed' +
           ' to guarantee the refresh token on every auth', function() {
            expect(youtube.schema.oauth2.authParams.approvalPrompt).to.eq('force');
        });
    });

    describe('#tick(reader)', function() {

        var api = nock('https://www.googleapis.com/youtube/v3',{
            reqheaders: {
                'authorization': 'Bearer test-token'
            }
        });

        afterEach(function() {
            api.done();
        });

        it('returns a promise', function() {
            expect(youtube.tick({})).to.be.instanceOf(require('promise'));
        });

        describe('on a successfull call to channels', function() {

            beforeEach(function() {
                api
                .get('/channels?part=contentDetails&mine=true&maxResults=50')
                .reply(200, {
                    items: [{
                        contentDetails: {
                            relatedPlaylists: {
                                watchHistory: 'watchhistoryid'
                            }
                        }
                    }]
                });
            });

            describe('and a successfull call to playlistitems', function() {

                var profile = {
                    displayName: 'displayName',
                    _json: {
                        url: 'profileUrl'
                    }
                };

                var videos = [{
                    id: '1',
                    snippet: {
                        publishedAt: '1989-12-09T08:00:00.0Z',
                        title: 'video title',
                        thumbnails: {
                            medium: {
                                url: 'http://somepicture1'
                            }
                        }
                    },
                    contentDetails: {
                        videoId: 'videoId'
                    }
                },{
                    id: '2',
                    snippet: {
                        publishedAt: '1989-12-09T08:00:01.0Z',
                        title: 'video title 2',
                        thumbnails: {
                            high: {
                                url: 'http://somepicture2'
                            }
                        }
                    },
                    contentDetails: {
                        videoId: 'videoId2'
                    }
                }];

                beforeEach(function() {
                    api
                    .get('/playlistItems?part=contentDetails%2Csnippet&playlistId=watchhistoryid&maxResults=50')
                    .reply(200, {
                        items: [videos[0]],
                        nextPageToken: 'somethingrandom'
                    })
                    .get('/playlistItems?part=contentDetails%2Csnippet&playlistId=watchhistoryid&maxResults=50&pageToken=somethingrandom')
                    .reply(200, {
                        items: [videos[1]]
                    });
                });

                it('resolves to the videos from the users watch history', function() {
                    return expect(youtube.tick({
                        token: 'test-token',
                        profile: profile
                    })).to.eventually.deep.equal([{
                        source_id: '1',
                        source: videos[0],
                        date: new Date('1989-12-09T08:00:00.0Z'),
                        semantics: {
                            verb: "watched",
                            what: [{
                                picture: "http://somepicture1",
                                title: "video title",
                                type: "video",
                                url: "//www.youtube.com/watch?v=videoId"
                            }],
                            when: new Date('1989-12-09T08:00:00.0Z'),
                            who: {
                                isYou: true,
                                name: "displayName",
                                url: "profileUrl"
                            }
                        }
                    },{
                        source_id: '2',
                        source: videos[1],
                        date: new Date('1989-12-09T08:00:01.0Z'),
                        semantics: {
                            verb: "watched",
                            what: [{
                                picture: "http://somepicture2",
                                title: "video title 2",
                                type: "video",
                                url: "//www.youtube.com/watch?v=videoId2"
                            }],
                            when: new Date('1989-12-09T08:00:01.0Z'),
                            who: {
                                isYou: true,
                                name: "displayName",
                                url: "profileUrl"
                            }
                        }
                    }]);
                });
            });

            describe('and an errored call to playlistitems', function() {

                beforeEach(function() {
                    api
                    .get('/playlistItems?part=contentDetails%2Csnippet&playlistId=watchhistoryid&maxResults=50')
                    .reply(500, "Fatal error");
                });

                it('rejects with the response text', function() {
                    return expect(youtube.tick({
                        token: 'test-token'
                    })).to.eventually.be.rejectedWith('Fatal error');
                });
            });
        });

        describe('on an errored call to channels', function() {

            beforeEach(function() {
                api
                .get('/channels?part=contentDetails&mine=true&maxResults=50')
                .reply(500, 'Horrible error');
            });

            it('rejects with the response text', function() {
                return expect(youtube.tick({
                    token: 'test-token'
                })).to.eventually.be.rejectedWith('Horrible error');
            });
        });

        it('rejects if there is no token specified', function() {
            return expect(youtube.tick({})).to.eventually.be.rejected;
        });
    });
});
