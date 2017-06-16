var http = require('http');


var server = http.createServer(function (request, response) {
    console.log(request.headers);
    response.end('123')
});
server.listen(8080);
console.log("Server runing at port: " + 8080 + ".");