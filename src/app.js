/*
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port);

*/
port = 8000;
var express = require('express')
var app = express();

var http = require('http')
var server = http.server(app)

app.use(express.static('client'))

server.listen(PORT, function() {
    console.log('server running')
})

var io = require('socket.io')(server)

io.on('connection', function(socket) {
    socket.on('message', function(msg){
        io.emit('message', msg)
    })
})

//document.writeln("jojo")