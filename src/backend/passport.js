var Passport = require('passport').Passport;
var Strategy = require('passport').Strategy;
var util = require('util');
var db = require('./db');

function DiaryStrategy(verify) {
    Strategy.call(this);
    this.name = 'diary';
    this._verify = verify;
}
util.inherits(DiaryStrategy, Strategy);

DiaryStrategy.prototype.authenticate = function(req) {
    if (req.user) {
        this.success(req.user);
    } else {
        var username = req.query.username;
        var password = req.query.password;
        var self = this;

        if (!username || !password) {
            return this.fail();
        }

        try {
            this._verify(username, password, function(err, user, info) {
                if (err) return self.error(err);
                if (!user) return self.fail(info);
                self.success(user, info);
            });
        } catch (ex) {
            return self.error(ex);
        }
    }
};

var passport = module.exports = new Passport();

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    db.get('users').findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new DiaryStrategy(function(username, password, done) {
    db.get('users').findOne({ email: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (user.password !== password) { return done(null, false); }
        return done(null, user);
    });
}));
