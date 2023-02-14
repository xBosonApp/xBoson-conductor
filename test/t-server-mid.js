/**
 *  Copyright 2023 Jing Yanming
 * 
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
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