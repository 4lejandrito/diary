var EventEmitter2 = require('eventemitter2').EventEmitter2;

module.exports = new EventEmitter2({
    wildcard: true,
    delimiter: '.'
});
