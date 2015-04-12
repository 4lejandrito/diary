module.exports = {
    port: process.env.PORT,
    secret: process.env.SECRET,
    db: {
        url: process.env.MONGOLAB_URI
    }
};
