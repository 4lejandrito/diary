var chai = require("chai");
chai.use(require("chai-as-promised"));
var expect = chai.expect;
var github = require('backend/readers/github');
var parser = require('backend/parsers/github');
var mongoose = require('mongoose');
var nock = require('nock');

describe('github', function() {

    afterEach(function(done) {
        mongoose.connection.close(done);
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

        var reader = {
            token: 'test-token',
            profile: {username: '4lejandrito', id: 'alex'}
        };

        afterEach(function() {
            api.done();
        });

        it('returns a promise', function() {
            expect(github.tick({
                token: 'test-token',
                profile: {username: '4lejandrito'}
            })).to.be.instanceOf(require('promise'));
        });

        it('rejects if there is no token specified', function() {
            return expect(github.tick({
                profile: {username: '4lejandrito', id: 'alex'}
            })).to.eventually.be.rejected;
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

                return expect(github.tick(reader)).to.eventually.deep.equal([{
                    date: new Date('1989-12-09T08:00:00.0Z'),
                    source_id: '1',
                    source: githubEvents[0],
                    semantics: parser(reader, githubEvents[0])
                },{
                    date: new Date('1989-12-09T08:00:01.0Z'),
                    source_id: '2',
                    source: githubEvents[1],
                    semantics: parser(reader, githubEvents[1])
                },{
                    date: new Date('1989-12-09T08:00:02.0Z'),
                    source_id: '3',
                    source: githubEvents[2],
                    semantics: parser(reader, githubEvents[2])
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

        describe('can parse', function() {

            it('CreateEvent', function() {
                expect(parser(reader, {
                    id: '1',
                    created_at: '1989-12-09T08:00:00.0Z',
                    type: 'CreateEvent',
                    payload: {
                        ref_type: 'branch',
                        ref: '1234'
                    },
                    actor: {
                        login: '4lejandrito',
                        id: 'alex'
                    }
                })).to.deep.equal({
                    verb: 'created',
                    who: {
                        type: 'person',
                        name: '4lejandrito',
                        url: 'https://github.com/4lejandrito',
                        isYou: true
                    },
                    complements: [],
                    what: [{
                        article: 'the',
                        type: 'branch',
                        name: '1234'
                    }],
                    when: new Date('1989-12-09T08:00:00.0Z')
                });
            });

            it('DeleteEvent', function() {
                expect(parser(reader, {
                    id: '1',
                    created_at: '1989-12-09T08:00:00.0Z',
                    type: 'DeleteEvent',
                    payload: {
                        ref_type: 'branch',
                        ref: '1234'
                    },
                    actor: {
                        login: '4lejandrito',
                        id: 'alex'
                    }
                })).to.deep.equal({
                    verb: 'deleted',
                    who: {
                        type: 'person',
                        name: '4lejandrito',
                        url: 'https://github.com/4lejandrito',
                        isYou: true
                    },
                    complements: [],
                    what: [{
                        type: 'branch',
                        name: '1234'
                    }],
                    when: new Date('1989-12-09T08:00:00.0Z')
                });
            });

            it('IssueCommentEvent', function() {
                expect(parser(reader, {
                    id: '1',
                    created_at: '1989-12-09T08:00:00.0Z',
                    type: 'IssueCommentEvent',
                    payload: {
                        action: 'commented',
                        comment: {
                            html_url: 'commenthtmlurl',
                            body: 'commenttext'
                        },
                        issue: {
                            html_url: 'isssuehtmlurl',
                            number: 1,
                            title: 'issueTitle',
                            body: 'issueBody'
                        }
                    },
                    actor: {
                        login: '4lejandrito',
                        id: 'alex'
                    }
                })).to.deep.equal({
                    verb: 'commented',
                    who: {
                        type: 'person',
                        name: '4lejandrito',
                        url: 'https://github.com/4lejandrito',
                        isYou: true
                    },
                    complements: [{
                        preposition: 'for',
                        article: 'the',
                        type: 'issue',
                        name: '#1',
                        text: 'issueBody',
                        title: 'issueTitle',
                        url: 'isssuehtmlurl'
                    }],
                    what: [{
                        type: 'comment',
                        text: 'commenttext',
                        url: 'commenthtmlurl'
                    }],
                    when: new Date('1989-12-09T08:00:00.0Z')
                });
            });

            it('IssuesEvent', function() {
                expect(parser(reader, {
                    id: '1',
                    created_at: '1989-12-09T08:00:00.0Z',
                    type: 'IssuesEvent',
                    payload: {
                        action: 'added',
                        issue: {
                            html_url: 'isssuehtmlurl',
                            number: 1,
                            title: 'issueTitle',
                            body: 'issueBody'
                        }
                    },
                    actor: {
                        login: '4lejandrito',
                        id: 'alex'
                    }
                })).to.deep.equal({
                    verb: 'added',
                    who: {
                        type: 'person',
                        name: '4lejandrito',
                        url: 'https://github.com/4lejandrito',
                        isYou: true
                    },
                    complements: [],
                    what: [{
                        article: 'the',
                        type: 'issue',
                        name: '#1',
                        text: 'issueBody',
                        title: 'issueTitle',
                        url: 'isssuehtmlurl'
                    }],
                    when: new Date('1989-12-09T08:00:00.0Z')
                });
            });

            it('MemberEvent', function() {
                expect(parser(reader, {
                    id: '1',
                    created_at: '1989-12-09T08:00:00.0Z',
                    type: 'MemberEvent',
                    payload: {
                        action: 'added',
                        member: {
                            login: 'someuser',
                            id: 'someid'
                        }
                    },
                    actor: {
                        login: '4lejandrito',
                        id: 'alex'
                    }
                })).to.deep.equal({
                    verb: 'added',
                    who: {
                        type: 'person',
                        name: '4lejandrito',
                        url: 'https://github.com/4lejandrito',
                        isYou: true
                    },
                    complements: [],
                    what: [{
                        type: 'person',
                        name: 'someuser',
                        url: 'https://github.com/someuser',
                        isYou: false
                    }],
                    when: new Date('1989-12-09T08:00:00.0Z')
                });
            });

            it('PullRequestEvent', function() {
                expect(parser(reader, {
                    id: '1',
                    created_at: '1989-12-09T08:00:00.0Z',
                    type: 'PullRequestEvent',
                    payload: {
                        action: 'created',
                        pull_request: {
                            html_url: 'prhtmlurl',
                            number: 2,
                            title: 'prtitle',
                            body: 'prbody'
                        }
                    },
                    actor: {
                        login: '4lejandrito',
                        id: 'alex'
                    }
                })).to.deep.equal({
                    verb: 'created',
                    who: {
                        type: 'person',
                        name: '4lejandrito',
                        url: 'https://github.com/4lejandrito',
                        isYou: true
                    },
                    complements: [],
                    what: [{
                        article: 'the',
                        type: 'pull request',
                        name: '#2',
                        title: 'prtitle',
                        text: 'prbody',
                        url: 'prhtmlurl'
                    }],
                    when: new Date('1989-12-09T08:00:00.0Z')
                });
            });

            it('CommitCommentEvent', function() {
                expect(parser(reader, {
                    id: '1',
                    created_at: '1989-12-09T08:00:00.0Z',
                    type: 'CommitCommentEvent',
                    payload: {
                        comment: {
                            html_url: 'commenthtmlurl',
                            body: 'commenttext',
                            commit_id: '48758789769576945769'
                        }
                    },
                    repo: {
                        name: 'somerepo'
                    },
                    actor: {
                        login: '4lejandrito',
                        id: 'alex'
                    }
                })).to.deep.equal({
                    verb: 'created',
                    who: {
                        type: 'person',
                        name: '4lejandrito',
                        url: 'https://github.com/4lejandrito',
                        isYou: true
                    },
                    complements: [{
                        preposition: 'for',
                        article: 'the',
                        type: 'commit',
                        name: '48758789',
                        url: 'https://github.com/somerepo/commit/48758789769576945769'
                    },{
                        article: "the",
                        name: "somerepo",
                        preposition: "in",
                        type: "repository",
                        url: "https://github.com/somerepo"
                    }],
                    what: [{
                        type: 'comment',
                        text: 'commenttext',
                        url: 'commenthtmlurl'
                    }],
                    when: new Date('1989-12-09T08:00:00.0Z')
                });
            });

            it('PushEvent', function() {
                expect(parser(reader, {
                    id: '1',
                    created_at: '1989-12-09T08:00:00.0Z',
                    type: 'PushEvent',
                    payload: {
                        commits: [{
                            author: {
                                email: 'email1'
                            },
                            sha: 'thesha1',
                            message: 'committext1'
                        },{
                            author: {
                                email: 'email2'
                            },
                            sha: 'thesha2',
                            message: 'committext2'
                        }]
                    },
                    repo: {
                        name: 'somerepo'
                    },
                    actor: {
                        login: '4lejandrito',
                        id: 'alex'
                    }
                })).to.deep.equal({
                    verb: 'pushed',
                    who: {
                        type: 'person',
                        name: '4lejandrito',
                        url: 'https://github.com/4lejandrito',
                        isYou: true
                    },
                    complements: [{
                        preposition: "to",
                        article: "the",
                        name: "somerepo",
                        type: "repository",
                        url: "https://github.com/somerepo"
                    }],
                    what: [{
                        source: 'email1',
                        text: 'committext1',
                        type: 'commit',
                        url: 'https://github.com/somerepo/commit/thesha1'
                    },{
                        source: 'email2',
                        text: 'committext2',
                        type: 'commit',
                        url: 'https://github.com/somerepo/commit/thesha2'
                    }],
                    when: new Date('1989-12-09T08:00:00.0Z')
                });
            });

            it('ForkEvent', function() {
                expect(parser(reader, {
                    id: '1',
                    created_at: '1989-12-09T08:00:00.0Z',
                    type: 'ForkEvent',
                    payload: {
                        forkee: {
                            name: 'somerepo1'
                        }
                    },
                    repo: {
                        name: 'somerepo'
                    },
                    actor: {
                        login: '4lejandrito',
                        id: 'alex'
                    }
                })).to.deep.equal({
                    verb: 'forked',
                    who: {
                        type: 'person',
                        name: '4lejandrito',
                        url: 'https://github.com/4lejandrito',
                        isYou: true
                    },
                    complements: [{
                        preposition: "from",
                        article: "the",
                        name: "somerepo",
                        type: "repository",
                        url: "https://github.com/somerepo"
                    }],
                    what: [{
                        article: 'the',
                        type: 'repository',
                        name: 'somerepo1',
                        url: 'https://github.com/somerepo1'
                    }],
                    when: new Date('1989-12-09T08:00:00.0Z')
                });
            });

            it('ReleaseEvent', function() {
                expect(parser(reader, {
                    id: '1',
                    created_at: '1989-12-09T08:00:00.0Z',
                    type: 'ReleaseEvent',
                    payload: {
                        action: 'released',
                        release: {
                            tag_name: 'releasename',
                            html_url: 'releaseurl'
                        }
                    },
                    repo: {
                        name: 'somerepo'
                    },
                    actor: {
                        login: '4lejandrito',
                        id: 'alex'
                    }
                })).to.deep.equal({
                    verb: 'released',
                    who: {
                        type: 'person',
                        name: '4lejandrito',
                        url: 'https://github.com/4lejandrito',
                        isYou: true
                    },
                    complements: [{
                        preposition: "in",
                        article: "the",
                        name: "somerepo",
                        type: "repository",
                        url: "https://github.com/somerepo"
                    }],
                    what: [{
                        article: 'the',
                        type: 'release',
                        name: 'releasename',
                        url: 'releaseurl'
                    }],
                    when: new Date('1989-12-09T08:00:00.0Z')
                });
            });
        });
    });
});
