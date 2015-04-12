module.exports = {
    port: 8000,
    secret: 'theappsecret',
    db: {
        url: 'mongodb://localhost/diary'
    },
    readers: process.cwd() + '/src/backend/readers'
};
