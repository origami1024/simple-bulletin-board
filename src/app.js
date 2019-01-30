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

app.listen(PORT);
