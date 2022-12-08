const mongoose = require('mongoose');
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/Vcl');
}

const connectToMongo = () => {
    main().then(() => { console.log("Connected to mongo successfully") }).catch(err => { console.log(err) });
}

module.exports = connectToMongo;