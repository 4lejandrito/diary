module.exports = {
    url: 'http://localhost:8000',
    port: 8000,
    secret: 'theappsecret',
    db: {
        url: 'mongodb://localhost/diary'
    },
    readers: process.cwd() + '/src/backend/readers',
    github: {
        clientID: '581238a03e96209edc2a',
        clientSecret: '0cf68d19c58c8550c27c837346a3e8a2d85e8fe3'
    },
    google: {
        clientID: '465976712585-lvhujkluq6qg96rkqnvsi4r2u2gevphq.apps.googleusercontent.com',
        clientSecret: '3X7TJokAFKo9sKcT85VlSVc-'
    }
};
