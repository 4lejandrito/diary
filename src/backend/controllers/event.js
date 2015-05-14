var moment = require('moment');
var Event = require('../models/event');

module.exports = {

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
    }
};
