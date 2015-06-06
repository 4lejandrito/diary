var moment = require('moment');
var extend = require('extend');
var Event = require('../models/event');

module.exports = {

    getFilter: function(req) {
        var year = parseInt(req.params.year || req.query.year);
        var month = parseInt(req.params.month || req.query.month);
        var day = parseInt(req.params.day || req.query.day);
        var start = moment().year(0), end = moment();
        var pageSize = req.query.pageSize;
        var what = req.query.what || [];

        if (!isNaN(year)) {
            start.year(year).startOf('year');
            end = moment(start).endOf('year');
        }
        if (!isNaN(month)) {
            start.month(month).startOf('month');
            end = moment(start).endOf('month');
        }
        if (!isNaN(day)) {
            start.date(day).startOf('day');
            end = moment(start).endOf('day');
        }

        return {
            start: start.toDate(),
            end: end.toDate(),
            q: req.params.q || req.query.q,
            limit: pageSize,
            skip: req.query.page * pageSize,
            what: what.map ? what : what.split(',')
        };
    },

    getEvents: function(req, res) {
        var filter = module.exports.getFilter(req);
        Event
        .find(extend({
            user: req.user.id,
            date: {$gte: filter.start, $lte: filter.end}
        }, filter.q && {$text: {$search: filter.q}},
           filter.what.length && {$or: filter.what.map(function(what) {
               return {'semantics.what.type': what};
           })}
        ))
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
        if (!isNaN(parseInt(req.params.month))) {
            _id = {day: {$dayOfMonth: "$date"}};
        }

        Event.aggregate([{
            $match: extend({
                user: req.user.id
            }, filter.q && {$text: {$search: filter.q}})
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
    },
    getOverview: function(req, res) {
        var filter = module.exports.getFilter(req);

        Event.aggregate([{
            $match: extend({
                user: req.user.id,
                'semantics.who.isYou': true
            }, filter.q && {$text: {$search: filter.q}})
        },{
            $project: {
                date:{
                    $add: ["$date", moment().utcOffset() * 60 * 1000]
                },
                semantics: 1
            }
        },{
            $match: {
                date: {$gte: filter.start, $lte: filter.end}
            }
        },{
            $unwind: '$semantics.what'
        },{
            $group: {
                _id: {
                    verb: '$semantics.verb',
                    type: '$semantics.what.type'
                },
                times: {$sum: 1}
            }
        },{
            $group : {
                _id :  "$_id.verb",
                what: {
                    $push: {
                        type: "$_id.type",
                        times: "$times"
                    }
                }
            }
        }], function(err, data) {
            res.send(err || data);
        });
    },
    newEvent: function(req, res) {
        Event.create(extend(req.body, {
            type: 'me',
            user: req.user.id,
            reader_id: 'MASTER',
            date: new Date(req.body.semantics.when)
        }), function(err, event) {
            res.send(err || event);
        });
    }
};
