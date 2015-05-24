var fs     = require('fs');
var config = require('config');
var _      = require('underscore');
var mongoose = require('mongoose');
var oauthRefresh = require('passport-oauth2-refresh');
var Event = require('./event');
var async = require('async');

var availableReaders = fs.readdirSync(config.readers).map(function(file) {
    return require(config.readers + '/' + file);
}), activeReaders = {};

var schema = new mongoose.Schema({
    type: {type: String, required: true},
    lastEvent: {type: Date, default: 0},
    token: {type: String},
    refreshToken: {type: String},
    settings: {type: Object, default: {}},
    profile: {type: Object, default: {}}
}, {toJSON: {virtuals: true}});

schema.virtual('metadata').get(function() {
    return (activeReaders[this.id] = activeReaders[this.id] || {
        state: 'stop',
        error: undefined
    });
});

schema.virtual('interval').get(function() {
    return schema.statics.forType(this.type).interval || config.interval;
});

schema.virtual('tick').get(function() {
    return schema.statics.forType(this.type).tick;
});

schema.statics.available = function() {
    return availableReaders;
};

schema.statics.forType = function(type) {
    return _.findWhere(this.available(), {type: type});
};

schema.methods.start = function() {
    async.doUntil(
        _.throttle(this.getEvents.bind(this), this.interval),
        function() {
            return this.metadata.state === 'stop';
        }.bind(this),
        function(err) {
            this.metadata.state = 'stop';
            this.metadata.error = err;
        }.bind(this)
    );
};

schema.methods.stop = function() {
    this.metadata.state = 'stop';
};

schema.methods.getEvents = function(done) {
    this.metadata.state = 'running';
    this.tick(this).then(function(events) {
        if (this.metadata.state === 'stop') return done();
        this.metadata.state = 'idle';
        Event.insert(this, events, done);
    }.bind(this)).catch(function(error) {
        if (this.refreshToken) {
            this.refreshOAuthToken(done);
        } else {
            done(error);
        }
    }.bind(this));
};

schema.methods.refreshOAuthToken = function(done) {
    oauthRefresh.requestNewAccessToken(
        this.type,
        this.refreshToken,
        function(err, newToken) {
            if (err) return done(err);
            this.token = newToken;
            this.parent().save(done);
        }.bind(this)
    );
};

module.exports = mongoose.model('Reader', schema);
