var cluster = require('cluster');

var process_count = 100;


if (cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < process_count; i++) {
    cluster.fork();
  }

  cluster.on('exit', function(worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died');
  });

} else {

  // Workers can share any TCP connection
  // In this case its a HTTP server
  setTimeout(function() {
    process.exit(0);
  }, 1000);

}