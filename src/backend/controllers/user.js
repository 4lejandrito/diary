var readers = require('../readers');
var moment = require('moment');
var uuid = require('node-uuid');
var users = require('../db').get('users');
var events = require('../db').get('events');
var extend = require('extend');

module.exports = {

    get: function(req, res) {
        res.send(req.user);
    },

    create: function(req, res) {
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

    logout: function(req, res) {
        req.logout();
        res.send('awesome');
    },

    getReaders: function(req, res) {
        res.send(readers.forUser(req.user));
    },

    addReader: function(req, res) {
        var reader = {
            id: uuid.v4(),
            type: req.params.type,
            settings: req.body
        };
        users.updateById(req.user._id, {
            $push: {readers: reader}
        }).on('success', function() {
            var wrapper = readers.create(reader, req.user);
            wrapper.start();
            res.send(wrapper);
        });
    },

    addReaderOAuth2: function(req, accessToken, refreshToken, profile, type, done) {
        var state = JSON.parse(new Buffer(req.query.state, 'base64').toString('ascii'));
        var reader = {
            id: uuid.v4(),
            type: type,
            token: accessToken,
            refreshToken: refreshToken,
            profile: profile,
            settings: state
        };
        users.updateById(req.user._id, {
            $push: {readers: reader}
        }).on('success', function() {
            var wrapper = readers.create(reader, req.user);
            wrapper.start();
            done(null, req.user);
        });
    },

    deleteReader: function(req, res) {
        users.updateById(req.user._id, {
            $pull : {readers : {id: req.params.id}}
        }).on('success', function() {
            events.remove({reader_id: req.params.id});
            res.send(readers.delete(req.user, req.params.id));
        });
    },

    getEvents: function(req, res) {
        events.find({
            user: req.user._id
        }, '-user').on('success', function(events) {
            res.send(events);
        });
    },

    getYearView: function(req, res) {
        var start = moment().year(parseInt(req.params.year)).startOf('year');
        var end = moment(start).endOf('year');

        events.col.aggregate([{
            $project: {
                date:{
                    $add: ["$date", moment().utcOffset() * 60 * 1000]
                },
                type: 1,
                user: 1
            }
        },{
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
        var start = moment().year(parseInt(req.params.year))
        .month(parseInt(req.params.month)).startOf('month');
        var end = moment(start).endOf('month');

        events.col.aggregate([{
            $project: {
                date:{
                    $add: ["$date", moment().utcOffset() * 60 * 1000]
                },
                type: 1,
                user: 1
            }
        },{
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
