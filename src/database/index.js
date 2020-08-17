const mongoose = require('mongoose');
const password = 'W4zOp2jF85qbM9DU';
const dbName = 'friendzone';
const url = `mongodb+srv://felipe:${password}@cluster0-yrlf0.mongodb.net/${dbName}?retryWrites=true&w=majority`;

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

mongoose.Promise = global.Promise;
module.exports = mongoose;

