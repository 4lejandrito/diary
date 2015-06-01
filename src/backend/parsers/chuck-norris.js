module.exports = function(body) {
    return {
        verb: 'shared',
        what: [{
            type: 'joke',
            text: body.value.joke
        }],
        who: {
            name: 'Chuck Norris',
            url: 'http://es.wikipedia.org/wiki/Chuck_Norris'
        },
        whom: {isYou: true}
    };
};
