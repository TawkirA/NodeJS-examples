const express = require('express');
const cluster = require('cluster');
const totalCPUs = require('os').availableParallelism();
const app = express();
const PORT = 3000;

if (cluster.isPrimary) {
    console.log(`Number of CPU is ${totalCPUs}`);
    console.log(`Primary ${process.pid} is running`);

    // Fork Worker
    for (let i = 0; i < totalCPUs; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        console.log(`Let's fork another worker!`);
        cluster.fork();
    })
} else {
    console.log(`Worker ${process.pid} started`);
    app.get('/', (req, res, next) => {
        res.send("Hello Cluster World!!");
    });

    app.get('/api/:n', (req, res, next) => {
        let n = parseInt(req.params.n);
        let count = 0;

        if (n > 5000000000) n = 5000000000;

        for (let i = 0; i <= n; i++) {
            count += i;
        }

        res.send(`Final count is ${count}`);
    });

    app.listen(PORT, () => {
        console.log(`App listening at PORT - ${PORT}`);
    });
}





