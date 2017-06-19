var http = require('http');


var server = http.createServer(function (request, response) {
    // response.writeHead(302,{
    //     location:'http://www.baidu.com'
    // })
    response.end("123")
});
server.listen(8080);
console.log("Server runing at port: " + 8080 + ".");