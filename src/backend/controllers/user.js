var readers = require('../readers');
var moment = require('moment');
var _ = require('underscore');

module.exports = {

    get: function(req, res) {
        res.send(req.user);
    },

    create: function(req, res) {
        var users = req.app.db.get('users');
        var email = req.body.email;
        var password = req.body.password;

        users.findOne({email: email}, function(err, user) {
            if (err) throw err;
            if (user) {
                return res.status(400).send('Existing user');
            } else {
                users.insert({email: email, password: password}, function(err, user) {
                    if (err) throw err;
                    res.send(user);
                });
            }
        });
    },

    getReaders: function(req, res) {
        res.send(readers.forUser(req.user));
    },

    addReader: function(req, res) {
        if(!req.user.readers) req.user.readers = {};
        req.user.readers[req.params.type] = req.body;
        req.app.db.get('users').updateById(req.user._id, req.user)
        .on('success', function(n) {
            var reader = readers.create(req.params.type, req.user);
            reader.start();
            res.send(reader);
        });
    },

    addReaderOAuth2: function(req, accessToken, reader, done) {
        if(!req.user.readers) req.user.readers = {};
        if (!req.user.readers[reader.type] || req.user.readers[reader.type].token !== accessToken) {
            req.user.readers[reader.type] = {token: accessToken};
            req.app.db.get('users').updateById(req.user._id, req.user)
            .on('success', function() {
                readers.create(reader.type, req.user).start();
                done(null, req.user);
            });
        } else {
            done(null, req.user);
        }
    },

    deleteReader: function(req, res) {
        delete req.user.readers[req.params.type];
        req.app.db.get('users').updateById(req.user._id, req.user)
        .on('success', function(n) {
            var reader = readers.delete(req.params.type, req.user);
            res.send(reader);
        });
    },

    getEvents: function(req, res) {
        req.app.db.get('events').find({
            user: req.user._id
        }, '-user').on('success', function(events) {
            res.send(events);
        });
    },

    getYearView: function(req, res) {
        var events = req.app.db.get('events');
        var start = moment().year(parseInt(req.params.year)).startOf('year');
        var end = moment(start).endOf('year');

        events.col.aggregate([{
            $match: {
                user: req.user._id,
                date: {$gte: start.toDate(), $lte: end.toDate()}
            }
        },{
            $group: {
                _id: {month: {$month: "$date"}, type: "$type"},
                count: {$sum: 1}
            }
        }], function(err, data) {
            res.send(data);
        });
    },

    getMonthView: function(req, res) {
        var events = req.app.db.get('events');
        var start = moment().year(parseInt(req.params.year))
        .month(parseInt(req.params.month)).startOf('month');
        var end = moment(start).endOf('month');

        events.col.aggregate([{
            $match: {
                user: req.user._id,
                date: {$gte: start.toDate(), $lte: end.toDate()}
            }
        },{
            $group: {
                _id: {day: {$dayOfMonth: "$date"}, type: "$type"},
                count: {$sum: 1}
            }
        }], function(err, data) {
            res.send(data);
        });
    },

    getDayView: function(req, res) {
        var events = req.app.db.get('events');
        var start = moment().year(parseInt(req.params.year))
        .month(parseInt(req.params.month))
        .date(parseInt(req.params.day)).startOf('day');
        var end = moment(start).endOf('day');

        events.find({
            user: req.user._id,
            date: {$gte: start.toDate(), $lte: end.toDate()}
        }, {sort : {date : -1}}).on('success', function(events) {
            res.send(events);
        });
    },
};
