/*
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port);

*/
PORT = 8000;
var express = require('express')
var app = express();
var path = require('path');

//var http = require('http')
//var server = http.Server(app)

//app.use(express.static('client'))

app.get('/', function(req, res) {
    console.log('PURF ' + path)
    
    res.sendFile(path.join(__dirname, '/../dist/index.html'));
});

/*//server.listen(PORT, function() {
    console.log('server running')
})
server.on("connection", function(){
    console.log("somon jonid")
})
var io = require('socket.io')(server)

io.on('connection', function(socket) {
    console.log('conn')
    socket.on('message', function(msg){
        io.emit('message', msg)
    })
})
*/
//document.writeln("jojo")