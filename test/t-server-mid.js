var http = require('http');

var beginport = 9999;
var endport = beginport + 3000;


for (var i=beginport; i<endport; ++i) {
  var server = http.createServer();
  server.on('request', rh);
  server.listen(i);
  console.log('listen', i);
}

console.log('all ok');


function rh(req, resp) {
  resp.end('hello');
}