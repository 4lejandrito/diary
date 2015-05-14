var uuid = require('node-uuid');
var mongoose = require('mongoose');
var async = require('async');

var schema = new mongoose.Schema({
    type: {type: String, required: true},
    description: {type: String},
    image: {type: String},
    date: {type: Date, default: Date.now},
    loggedAt: {type: Date, default: Date.now},
    user: {type: String, required: true},
    reader_id: {type: String, required: true},
    source_id: {type: String, default: uuid.v4},
    source: {type: Object, default: {}}
});

schema.index({reader_id: 1, source_id: 1}, {unique: true, sparse: true});

schema.statics.insert = function(events, cb) {
    var Event = this;
    async.filter(events, function(event, ok) {
        Event.create(event, function(err) {
            ok(!err);
        });
    }, cb);
};

module.exports = mongoose.model('Event', schema);
