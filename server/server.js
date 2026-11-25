const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

//connect Database. Uncomment below line after updating DB info in config/default.json
// connectDB();

const healthCheckRoutes = require('./routes/healthCheck');
const appInfoRoutes = require('./routes/appInfo');

var corsOptions = {
    origin: 'http://localhost:4200',
    methods: "POST, GET, PUT, DELETE"
}

app.use(cors(corsOptions));

// Init Middleware
app.use(express.json({ extended: false }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.get('/', (req, res) => res.send('Server Started'));
app.get('/healthCheck', (req, res) => res.send('Application is running!'));

// Define Routes
app.use('/api/v1/healthcheck', healthCheckRoutes);
app.use('/api/v1/appinfo', appInfoRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Welcome!! Server started on ${PORT}`));