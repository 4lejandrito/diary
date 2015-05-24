var rest = require('superagent');
var Promise = require('promise');
var async = require('async');
var qs = require('qs');
var extend = require('extend');

var Facebook = module.exports = function(params) {
    this.params = params;
    this.apiUrl = 'https://graph.facebook.com/v2.3/';
};

Facebook.prototype.getEdges = function(edge, params) {
    return new Promise(function (resolve, reject) {
        var edges = [],
            lastResponse = {},
            url = this.apiUrl + edge + '?' + qs.stringify(extend({}, this.params, params));

        async.doWhilst(function(cb) {
            rest.get(url).end(function(err, res) {
                try {
                    lastResponse = JSON.parse(res.text);
                    if (lastResponse.data) {
                        lastResponse.data.map(function(e) {
                            edges.push(e);
                        });
                    }
                } catch (error) {
                    return cb(error);
                }
                cb(err);
            });
        }, function() {
            return (url = lastResponse.paging && lastResponse.paging.next);
        }, function(err) {
            if (err) reject(err); else resolve(edges);
        });
    }.bind(this));
};
