module.exports = {
    port: process.env.PORT,
    secret: process.env.SECRET,
    db: {
        url: process.env.MONGOLAB_URI
    },
    github: {
        clientID: process.env.GITHUB_KEY,
        clientSecret: process.env.GITHUB_SECRET
    }
};
