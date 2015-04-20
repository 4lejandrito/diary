var config = require('config');
var extend = require('extend');
var OAuth2Strategy  = require('passport-oauth').OAuth2Strategy;
var oauthRefresh = require('passport-oauth2-refresh');
var passport = require('./passport');

module.exports = {
    register: function(app, reader, onAuth) {
        var Strategy = reader.schema.oauth2.strategy || OAuth2Strategy;

        var strategy = new Strategy(extend(true, {}, reader.schema.oauth2.params, {
            clientID: config.oauth2[reader.schema.oauth2.provider].clientID,
            clientSecret: config.oauth2[reader.schema.oauth2.provider].clientSecret,
            passReqToCallback: true,
            callbackURL: config.url + '/auth/' + reader.type + '/callback'
        }), function(req, accessToken, refreshToken, profile, done) {
            onAuth(req, accessToken, refreshToken, profile, reader.type, done);
        });

        passport.use(reader.type, strategy);
        oauthRefresh.use(reader.type, strategy);

        app.get('/auth/' + reader.type, function(req, res) {
            passport.authenticate(reader.type, extend({
                state: new Buffer(JSON.stringify(req.query)).toString('base64')
            }, reader.schema.oauth2.authParams))(req, res);
        });

        app.get('/auth/' + reader.type + '/callback', passport.authenticate(reader.type, {
            successRedirect: '/#/services',
            failureRedirect: '/#/services/new'
        }));
    },

    refreshToken: function(reader, done) {
        oauthRefresh.requestNewAccessToken(
            reader.type,
            reader.refreshToken,
            done
        );
    }
};
