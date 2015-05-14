var readers = require('../readers');
var moment = require('moment');
var User = require('../models/user');
var Event = require('../models/event');

module.exports = {

    get: function(req, res) {
        res.send(req.user);
    },

    create: function(req, res) {
        var email = req.body.email;
        var password = req.body.password;

        User.findOne({email: email}, function(err, user) {
            if (err) throw err;
            if (user) {
                return res.status(400).send('Existing user');
            } else {
                User.insert({email: email, password: password}, function(err, user) {
                    if (err) throw err;
                    res.send(user);
                });
            }
        });
    },

    logout: function(req, res) {
        req.logout();
        res.send('awesome');
    },

    getReaders: function(req, res) {
        res.send(readers.forUser(req.user));
    },

    addReader: function(req, res) {
        var reader = req.user.readers.create({
            type: req.params.type,
            settings: req.body
        });
        req.user.readers.push(reader);
        req.user.save(function() {
            var wrapper = readers.create(reader, req.user);
            wrapper.start();
            res.send(wrapper);
        });
    },

    addReaderOAuth2: function(req, accessToken, refreshToken, profile, type, done) {
        var state = JSON.parse(new Buffer(req.query.state, 'base64').toString('ascii'));
        var reader = req.user.readers.create({
            type: type,
            token: accessToken,
            refreshToken: refreshToken,
            profile: profile,
            settings: state
        });
        req.user.readers.push(reader);
        req.user.save(function() {
            var wrapper = readers.create(reader, req.user);
            wrapper.start();
            done(null, req.user);
        });
    },

    deleteReader: function(req, res) {
        req.user.readers.pull(req.params.id);
        req.user.save(function() {
            var deleted = readers.delete(req.user, req.params.id);
            Event.remove({reader_id: req.params.id}, function() {
                res.send(deleted);
            });
        });
    },

    getEvents: function(req, res) {
        Event.find({
            user: req.user.id
        }, '-user', function(err, events) {
            res.send(events);
        });
    },

    getYearView: function(req, res) {
        var start = moment().year(parseInt(req.params.year)).startOf('year');
        var end = moment(start).endOf('year');

        Event.aggregate([{
            $project: {
                date:{
                    $add: ["$date", moment().utcOffset() * 60 * 1000]
                },
                type: 1,
                user: 1
            }
        },{
            $match: {
                user: req.user.id,
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
        var start = moment().year(parseInt(req.params.year))
        .month(parseInt(req.params.month)).startOf('month');
        var end = moment(start).endOf('month');

        Event.aggregate([{
            $project: {
                date:{
                    $add: ["$date", moment().utcOffset() * 60 * 1000]
                },
                type: 1,
                user: 1
            }
        },{
            $match: {
                user: req.user.id,
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
        var start = moment().year(parseInt(req.params.year))
        .month(parseInt(req.params.month))
        .date(parseInt(req.params.day)).startOf('day');
        var end = moment(start).endOf('day');

        Event.find({
            user: req.user.id,
            date: {$gte: start.toDate(), $lte: end.toDate()}
        }).sort({date : -1}).exec(function(err, events) {
            res.send(events);
        });
    },
};
