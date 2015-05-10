module.exports = {
    url: 'https://diary-stage.herokuapp.com',
    port: process.env.PORT,
    secret: process.env.SECRET,
    db: {
        url: process.env.MONGOLAB_URI
    },
    oauth2: {
        github: {
            clientID: process.env.GITHUB_KEY,
            clientSecret: process.env.GITHUB_SECRET
        },
        google: {
            clientID: process.env.GOOGLE_KEY,
            clientSecret: process.env.GOOGLE_SECRET
        },
        facebook: {
            clientID: process.env.FACEBOOK_KEY,
            clientSecret: process.env.FACEBOOK_SECRET
        }
    },
    interval: 60 * 1000
};
