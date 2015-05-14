var Passport = require('passport').Passport;
var Strategy = require('passport').Strategy;
var util = require('util');
var User = require('./models/user');

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

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new DiaryStrategy(User.authenticate()));
