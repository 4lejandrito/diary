module.exports = {
    type: 'random',
    schema: {},
    instance: function(user, emit) {
        var interval;
        return {
            start: function() {
                interval = setInterval(function() {
                    emit({
                        value: Math.random()
                    });
                }, 500);
            },
            stop: function() {
                clearInterval(interval);
            }
        };
    }
};
