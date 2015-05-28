var moment = require('moment');
var extend = require('extend');
var Event = require('../models/event');

module.exports = {

    getFilter: function(req) {
        var year = parseInt(req.params.year || req.query.year);
        var month = parseInt(req.params.month || req.query.month);
        var day = parseInt(req.params.day || req.query.day);
        var start = moment().year(0), end = moment();

        if (year) {
            start.year(year).startOf('year');
            end = moment(start).endOf('year');
        }
        if (month) {
            start.month(month).startOf('month');
            end = moment(start).endOf('month');
        }
        if (day) {
            start.date(day).startOf('day');
            end = moment(start).endOf('day');
        }

        return {
            start: start.toDate(),
            end: end.toDate(),
            q: req.params.q || req.query.q,
            limit: req.query.pageSize,
            skip: req.query.page * req.query.pageSize
        };
    },

    getEvents: function(req, res) {
        var filter = module.exports.getFilter(req);
        Event
        .find(extend({
            user: req.user.id,
            date: {$gte: filter.start, $lte: filter.end}
        }, filter.q && {$text: {$search: filter.q}}))
        .sort({date : -1})
        .limit(filter.limit)
        .skip(filter.skip)
        .exec(function(err, events) {
            res.send(events);
        });
    },

    getEventsView: function(req, res) {
        var filter = module.exports.getFilter(req);
        var _id = {month: {$month: "$date"}};
        if (parseInt(req.params.month)) {
            _id = {day: {$dayOfMonth: "$date"}};
        }

        Event.aggregate([{
            $match: filter.q ? {$text: {$search: filter.q}} : {}
        },{
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
                date: {$gte: filter.start, $lte: filter.end}
            }
        },{
            $group: {
                _id: extend({type: "$type"}, _id),
                count: {$sum: 1}
            }
        }], function(err, data) {
            res.send(data);
        });
    }
};
