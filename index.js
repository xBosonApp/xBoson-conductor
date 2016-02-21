require('./init_java.js');

var clib    = require('configuration-lib');
var express = require('express');
var mixer   = require('mixer-lib');
var htmltpl = require('masquerade-html-lib').mid;
var logger  = require('logger-lib')('eeb');
var cluster = require('cluster');
var logsys  = require('./lib/log-sys.js');
var nm      = require('./lib/node-manager.js');
var mid     = require('./lib/mid.js');


var wsserver = nm.create_server();
logsys.master_log_listener(wsserver);


//
// 导出函数, 框架回调
//
module.exports = function(app_pool) {
	var route_saver = mixer.create_route_saver();
	var app   = express();
  var conf2 = clib.load();
  var host  = conf2.eeb_zy.ip + ':' + conf2.eeb_zy.port;
  var auth  = create_auth(conf2);

  if (auth) {
    app.use( route_saver('/eeb/login'), auth.login );
    app.use( auth.check );
  }

	app.use( htmltpl(route_saver('/eeb/ui')) );
  app.use( route_saver('/eeb/service') , mid() );
  app.use( route_saver('/eeb/log') , logger.mid.log(host) );

	var route = app_pool.addApp(mixer.express(app));
	route.add(route_saver);
};


function create_auth(conf2) {
  if (!(conf2.eeb_zy.use_auth && conf2.eeb_zy.has_zy_server))
    return;
  logger.log('启用了权限管理, 不同用户的节点被隔离');

  var auth    = require('auth-lib');
  var zyurl   = 'http://' + conf2.eeb_zy.ip + ':' + conf2.eeb_zy.port;
  var apiurl  = zyurl + '/ds/api';
  var zy      = auth.authenticate.zy(apiurl, conf2.eeb_zy.sys);
  var ck      = auth.persistence.cookie('/eeb/ui/index.htm');
  var amid    = auth.create_mid(zy, ck);
  return amid;
}


//
// 这段代码允许这个脚本独立运行
//
if (!module.parent) {
  clib.wait_init(function() {
    clib.save(clib.load(), function() {
      logger.log('Config file rebuild');

      var conf = {
        whenLoad: module.exports
      };

      mixer.create_http_mix_server(conf);
    });
  });
}
