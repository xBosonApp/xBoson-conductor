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
var wslib   = require('websocket-lib');
var conf2   = require('configuration-lib').load();
var http    = require('http');
var qs      = require('querystring');
var logger  = require('logger-lib')('eeb-mana');
var tl      = require('./tool.js');
var local   = require('./local-db.js');
var h2      = require('./h2-data.js');

//
// WORK_NODE.prefix : msg { prefix, port, pss ... }
//
var work_map = {};

//
// WORK_NODE.id : WORK_NODE.prefix
//
var id_map = {};

var ETL = 1;
var ESB = 2;
var BPM = 4;


//
// 多机集群管理模块, 通过 wnid 这个动态变化的参数区分不同的集群节点
// id 属性在节点初始化后即固定
//
module.exports = {
  create_server       : create_server,
  get_work_node_msg   : get_work_node_msg,
  get_wnid            : get_wnid,
};


function create_server() {
  var wsserver = wslib.proxyServer(conf2.eeb_zy.ws_server);
  // 在初始化完成之前, 所有的注册消息都暂时保存在这里
  var wait_list = [];
  

  //
  // 初始化的事情都可以在这里做
  //
  h2.clean_node_list(function(err) {
    logger.log(err || 'clean_node_list success');

    wait_list.forEach(function(parm) {
      reg_work_node_handle(parm.client, parm.msg);
    });

    wait_list = null;
  });


  wsserver.on('reg_work_node', function(client, msg) {
    if (wait_list) {
      wait_list.push({ client : client, msg : msg });
    } else {
      reg_work_node_handle(client, msg);
    }
  });


  //
  // 下面的函数都是客户端会通过 ws 调用
  //
  wsserver.on('rc_conf_save',  rc_conf_save);
  wsserver.on('rc_conf_new',   rc_conf_new);
  wsserver.on('rc_conf_del',   rc_conf_del);
  wsserver.on('get_job_group', get_job_group);
  wsserver.on('get_sche_data', get_sche_data);
  wsserver.on('get_varnish',   get_varnish);


  function reg_work_node_handle(client, msg) {
    msg.ip            = client.conn.remoteAddress;
    msg.proxy_host    = client.handshake.headers.host;
    msg.direct_proxy  = wsserver.direct_proxy;

    tl.reg_node_to_user(msg.logusr, msg.id, function(err) {
      if (err) {
        var msgstr = '节点注册被拒绝: (' + msg.logusr + ') ' + err.message;
        logger.error('reg_node_to_user fail.', msgstr);
        client.emit('logger', { msg: msgstr, type: 'error' });
        client.disconnect();
        return;
      }

      var disconn = client_conn(client, msg);
      client.on('disconnect', disconn);
    });
  }

  return wsserver;
}


//
// 管理到节点的连接
//
function client_conn(client, msg) {

  function on_connect() {
    if (!msg.id) return do_close('id is null');
    logger.debug('on connect', msg.host, msg.ip, msg.os, msg.prefix);
    
    var wnid = msg.prefix;
    work_map[ wnid ] = msg;
    id_map[ msg.id ] = wnid;

    h2.new_node_conn(msg, function(err) {
      if (err) logger.error(err);
      get_client_list(client, wnid, msg.id);
    });
  }


  function on_close() {
    var wnid = msg.prefix;
    h2.node_disconn(msg);
    delete work_map[ wnid ];
    delete id_map[ msg.id ];
  }


  function do_close(msg) {
    msg && logger.error('Err:', msg);
    client.disconnect();
  }

  on_connect();
  return on_close;
}


function get_client_list(client, wnid, id) {
  _get(ETL, function(err) {
    if (err) logger.error(wnid, 'Req ETL config list ERR:', err);
    _get(ESB, function(err) {
      if (err) logger.error(wnid, 'Req ESB config list ERR:', err);
      client.emit('logger', {
        type: 'info',
        msg : 'Client Success ' + wnid,
      });
      logger.info(wnid, 'Req configs list over.');
    });
  });


  function _get(type, rcb) {
    client.emit('getlist', { type: type });
    client.once('getlist_ret', function(msg) {
      _ret(msg.err, msg.data);
    });

    function _ret(err, data) {
      if (err) return rcb(err);

      tl.asyn_loop_arr(data, function(n, i, nextdata) {
        h2.init_job(n, id, nextdata);
      }, rcb);
    }
  }
}


function ret_handle(err) {
  err && logger.log(err);
}


//
// wnid -- msg.prefix
//
function get_work_node_msg(wnid, rcb) {
  if (!wnid) {
    rcb(new Error('缺少 wnid 参数'));
    return;
  }

  var msg = work_map[ wnid ];

  if (msg) {
    rcb(null, msg);
  } else {
    rcb(new Error(wnid + ' 找不到, 集群节点已离线'));
  }
}


//
// 通过 ID 取得动态 wnid, 同步方法
// rcb(err, wnid) err 永远为 null
//
function get_wnid(id, rcb) {
  var wnid = id_map[id];
  rcb(null, wnid);
}


function get_job_group(cli, msg) {
  h2.job_list({ id: msg.rid }, 0, 1, function(err, ret) {
    var retd = {};

    if (err) {
      retd.err = err;
    } else {
      try {
        retd.ret = ret.data[0].GID;
      } catch(_e) {
        retd.err = _e;
      }
    }
    
    cli.emit(msg.retid, retd);
  });
}


function get_sche_data(cli, msg) {
  h2.sche_get(msg.id, function(err, dat) {
    cli.emit(msg.retid, { err: err, ret: dat });
  });
}


function get_varnish(cli, msg) {
  local.get_varnish(msg.vid, function(err, v) {
    cli.emit(msg.retid, { err: err, ret: v });
  });
}


function rc_conf_save(client, rc) {
  local.save_rc(rc, ret_handle);
  h2.job_change_attr({ name: rc.name, id: rc.rid }, ret_handle);
}


function rc_conf_new(client, msg) {
  h2.job_create(msg.rc, msg.id, ret_handle);
}


function rc_conf_del(client, rid) {
  local.delete_rc(rid, ret_handle);
  h2.job_delete(rid, ret_handle);
}