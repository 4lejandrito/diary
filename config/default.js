module.exports = {
    port: 8000,
    db: {
        url: 'mongodb://localhost/diary'
    },
    readers: process.cwd() + '/src/backend/readers'
};
