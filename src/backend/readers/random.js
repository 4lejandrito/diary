module.exports = {
    type: 'random',
    image: 'https://www.random.org/analysis/randbitmap-rdo-section.png',
    description: 'Tracks random events, pretty useless',
    schema: {
        interval: 500
    },
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
