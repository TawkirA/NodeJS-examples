const http = require('http');

const server = http.createServer(function(requset, response, next) {
    response.write('Server Created');
    // response.end();
    // next();

    let url = requset.url;

    if (url === '/') {
        response.write('Home Route');
        console.log("first");
        setImmediate(() => {
            console.log("second");
        });
        console.log("third");
        response.end();
        // process.exit(1);
    } else if (url === '/about') {
        response.write('About Route');
        response.end();
        // process.exit(1);
    }
})

server.listen(4000, () => {
    console.log('Server is running at port - 4000')
});



