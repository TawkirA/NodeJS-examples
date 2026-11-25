require("dotenv").config();
require("./config/database").connect();
const express = require('express');
const path = require('path');

const authRoutes = require('./routes/auth');

const app = express();

app.use(express.json());

// Routes 
app.use('/auth', authRoutes);
app.get('/pay', (req, res) => {
    res.sendFile(path.join(__dirname + "/views/index.html"));
});

module.exports = app;
