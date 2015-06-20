var extend = require('extend');

var Noun = {
    type: {type: String},
    name: {type: String},
    url: {type: String},
    picture: {type: String},
    title: {type: String},
    text: {type: String},
    source: {type: String}
};

var Person = extend({}, Noun, {
    isYou: {type: Boolean}
});

var NounPhrase = extend({}, extend(Noun, Person), {
    article: {type: String, default: 'a'},
});

var Complement = extend({}, NounPhrase, {
    preposition: {type: String, default: 'to'}
});

var Location = {
    name: {type: String},
    coordinates: {type: [Number], index: '2dsphere'},
    city: {type: String},
    country: {type: String},
    zip: {type: String}
};

module.exports = {
    verb: {type: String, required: true},
    what: [NounPhrase],
    complements: [Complement],
    who: Person,
    whom: Person,
    where: Location,
    when: {type: Date, default: Date.now},
    text: {type: String}
};
