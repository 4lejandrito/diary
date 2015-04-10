var readers = require('../readers');
var moment = require('moment');
var uuid = require('node-uuid');

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

    logout: function(req, res) {
        req.logout();
        res.send('awesome');
    },

    getReaders: function(req, res) {
        res.send(req.user.readers || []);
    },

    addReader: function(req, res) {
        var reader = {
            id: uuid.v4(),
            type: req.params.type,
            settings: req.body
        };
        req.app.db.get('users').updateById(req.user._id, {
            $push: {readers: reader}
        }).on('success', function() {
            var wrapper = readers.create(reader, req.user);
            wrapper.start();
            res.send(wrapper);
        });
    },

    addReaderOAuth2: function(req, accessToken, type, done) {
        var reader = {
            id: uuid.v4(),
            type: type,
            settings: {
                token: accessToken
            }
        };
        req.app.db.get('users').updateById(req.user._id, {
            $push: {readers: reader}
        }).on('success', function() {
            var wrapper = readers.create(reader, req.user);
            wrapper.start();
            done(null, req.user);
        });
    },

    deleteReader: function(req, res) {
        req.app.db.get('users').updateById(req.user._id, {
            $pull : {readers : {id: req.params.id}}
        }).on('success', function() {
            res.send(readers.delete(req.user, req.params.id));
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
        var events = req.app.db.get('events');
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
