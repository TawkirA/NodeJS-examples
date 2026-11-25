const mongoose = require('mongoose');
const config = require('config');

const connectDB = async () => {
    const db = process.env.DB_NAME;
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // createIndexes: true
        });
        console.log('MongoDB connected');
    } catch(err) {
        console.log(err.message);
        // exit process with failure
        process.exit(1);
    }
}

module.exports = connectDB;
