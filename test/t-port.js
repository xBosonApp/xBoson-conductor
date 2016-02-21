var http = require('http');

st(999);
st(999);

function st(i) {
  var server = http.createServer();
  server.on('request', rh);

  server.on('error', function(err) {
    console.log(err.message);
  });

  server.listen(i, function() {
    console.log('Listening on', server.address());
  });
}

function rh(req, resp) {
  resp.end('hello');
}