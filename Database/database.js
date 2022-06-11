const mongodbuser = require('mongoose');
mongodbuser.Promise = global.Promise;

async function connection() {
    return await mongodbuser.connect('mongodb://localhost/Book')
    .then(() => console.log("Connection Done"))
    .catch(() => console.log("Connection Failure"))
};
const database = connection();

module.exports = database;