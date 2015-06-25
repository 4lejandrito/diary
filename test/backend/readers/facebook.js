var chai = require("chai");
chai.use(require("chai-as-promised"));
var expect = chai.expect;
var facebook = require('backend/readers/facebook');
var parser = require('backend/parsers/facebook');
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

        var reader = {
            token: 'test-token',
            lastEvent: Date.now(),
            profile: {
                id: 12345
            }
        };

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
                .get('/feed?access_token=test-token&since=' + (reader.lastEvent / 1000 | 0))
                .reply(200, JSON.stringify(feed[0]))
                .get('/feed?page=2')
                .reply(200, JSON.stringify(feed[1]))
                .get('/feed?page=3')
                .reply(200, JSON.stringify(feed[2]));

                return expect(facebook.tick(reader)).to.eventually.deep.equal([{
                    source_id: '1',
                    date: new Date('1989-12-09T08:00:00.0Z'),
                    source: feed[0].data[0],
                    semantics: parser(reader, feed[0].data[0])
                },{
                    source_id: '2',
                    date: new Date('1989-12-09T08:00:01.0Z'),
                    source: feed[1].data[0],
                    semantics: parser(reader, feed[1].data[0])
                },{
                    source_id: '3',
                    date: new Date('1989-12-09T08:00:02.0Z'),
                    source: feed[2].data[0],
                    semantics: parser(reader, feed[2].data[0])
                }]);
            });

            it('and rejects when one of the calls fails', function() {
                api
                .get('/feed?access_token=test-token&since=0')
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

        describe('can parse', function() {

            it('Links', function() {
                expect(parser(reader, {
                    id: '1',
                    created_time: '1989-12-09T08:00:00.0Z',
                    type: 'link',
                    from: {
                        id: 1234,
                        name: 'personame'
                    },
                    link: 'linkurl',
                    picture: 'pictureurl',
                    caption: 'linksource',
                    name: 'linktitle',
                    description: 'linktext'
                })).to.deep.equal({
                    verb: 'shared',
                    who: {
                        type: 'person',
                        name: 'personame',
                        url: 'http://facebook.com/app_scoped_user_id/1234',
                        isYou: false
                    },
                    complements: [],
                    what: [{
                        type: 'link',
                        picture: 'pictureurl',
                        source: 'linksource',
                        text: 'linktext',
                        title: 'linktitle',
                        url: 'linkurl'
                    }],
                    where: undefined,
                    whom: undefined,
                    when: new Date('1989-12-09T08:00:00.0Z')
                });
            });
            describe('Statuses', function() {
                it('Wall Posts', function() {
                    expect(parser(reader, {
                        id: '1',
                        created_time: '1989-12-09T08:00:00.0Z',
                        type: 'status',
                        status_type: 'wall_post',
                        from: {
                            id: 12345,
                            name: 'personame'
                        },
                        message: 'messagetext'
                    })).to.deep.equal({
                        verb: 'posted',
                        who: {
                            type: 'person',
                            name: 'personame',
                            url: 'http://facebook.com/app_scoped_user_id/12345',
                            isYou: true
                        },
                        complements: [{
                            preposition: 'on',
                            article: 'your',
                            type: 'wall'
                        }],
                        what: [{
                            article: 'a',
                            type: 'message',
                            text: 'messagetext',
                            url: '//www.facebook.com/1'
                        }],
                        where: undefined,
                        whom: undefined,
                        when: new Date('1989-12-09T08:00:00.0Z')
                    });
                });
                it('Others', function() {
                    expect(parser(reader, {
                        id: '1',
                        created_time: '1989-12-09T08:00:00.0Z',
                        type: 'status',
                        status_type: 'whatever',
                        from: {
                            id: 1234,
                            name: 'personame'
                        },
                        message: 'messagetext'
                    })).to.deep.equal({
                        verb: 'changed',
                        who: {
                            type: 'person',
                            name: 'personame',
                            url: 'http://facebook.com/app_scoped_user_id/1234',
                            isYou: false
                        },
                        complements: [],
                        what: [{
                            article: 'the',
                            type: 'status',
                            text: 'messagetext',
                            url: '//www.facebook.com/1'
                        }],
                        where: undefined,
                        whom: undefined,
                        when: new Date('1989-12-09T08:00:00.0Z')
                    });
                });
            });
            it('Photos', function() {
                expect(parser(reader, {
                    id: '1',
                    created_time: '1989-12-09T08:00:00.0Z',
                    type: 'photo',
                    from: {
                        id: 1234,
                        name: 'personame'
                    },
                    link: 'linkurl',
                    picture: 'pictureurl',
                    caption: 'linksource',
                    name: 'linktitle',
                    description: 'linktext',
                    message: 'picturetext'
                })).to.deep.equal({
                    verb: 'shared',
                    who: {
                        type: 'person',
                        name: 'personame',
                        url: 'http://facebook.com/app_scoped_user_id/1234',
                        isYou: false
                    },
                    complements: [],
                    what: [{
                        type: 'picture',
                        picture: 'pictureurl',
                        text: 'picturetext',
                        url: 'linkurl'
                    }],
                    where: undefined,
                    whom: undefined,
                    when: new Date('1989-12-09T08:00:00.0Z')
                });
            });
            it('Videos', function() {
                expect(parser(reader, {
                    id: '1',
                    created_time: '1989-12-09T08:00:00.0Z',
                    type: 'video',
                    from: {
                        id: 1234,
                        name: 'personame'
                    },
                    link: 'linkurl',
                    picture: 'pictureurl',
                    caption: 'linksource',
                    name: 'videotitle',
                    description: 'videotext',
                    message: 'picturetext'
                })).to.deep.equal({
                    verb: 'shared',
                    who: {
                        type: 'person',
                        name: 'personame',
                        url: 'http://facebook.com/app_scoped_user_id/1234',
                        isYou: false
                    },
                    complements: [],
                    what: [{
                        type: 'video',
                        picture: 'pictureurl',
                        text: 'videotext',
                        title: 'videotitle',
                        url: 'linkurl'
                    }],
                    where: undefined,
                    whom: undefined,
                    when: new Date('1989-12-09T08:00:00.0Z')
                });
            });
            it('Locations');
            it('Tags');
            it('People');
        });
    });
});
