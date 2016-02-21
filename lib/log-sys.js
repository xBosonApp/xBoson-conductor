var logger  = require('logger-lib')('eeb-log');
var h2      = require('./h2-data.js');
var biz     = logger('eeb-biz');

// 用于空参数
var N0; 
var S0 = '';
var ETL = 1;
var ESB = 2;

//
// 函数约定: 
// 1. 调用时参数 ({rc, tbegin, runtimeid, instanceid})
// 2. 返回对象 return { det : Function(), sta : Function() };
// 其他约定在 virtuoso:log-sys.js 中
//
module.exports = {
  master_log_listener : use_websocket_msg_server,
};


//
// 接收日志服务器
//
function use_websocket_msg_server(wsserver) {
  //
  // runtimeid : log_object
  // 消息中含有 runtimeid 属性, 用来区分不同的日志组
  //
  var log_map = {};

  _ON('init', init_peer_log);
  _ON('cls', close_peer_log);
  _COMM_ON('det');
  _COMM_ON('sta');
  _COMM_ON('cnt');
  _COMM_ON('err');
  _COMM_ON('srv_beg');
  _COMM_ON('srv_end');


  function _COMM_ON(name) {
    // 如果 _log 抛出空异常, 可能是 log_map 太早的清除了数据
    _ON(name, function(_msg, _log) {
      _log && _log[ name ](_msg.parm);
    });
  }

  function _ON(name, handle) {
    wsserver.on('log_sys_' + name, function(client, msg) {
      handle(msg, log_map[msg.runtimeid]);
    });
  }

  function init_peer_log(msg, _log) {
    if (!msg.runtimeid) throw new Error('msg.runtimeid 必须设置');
    if (_log) throw new Error('msg.runtimeid 冲突');
    log_map[msg.runtimeid] = use_local_db_log(msg);
  }

  function close_peer_log(_msg, _log) {
    // 等待因网络延迟而未收到的数据
    if (_log) {
      setTimeout(function() {
        delete log_map[_msg.runtimeid];
        logger.debug('Log sys close', _msg.runtimeid);
      }, 5000*2);
    }
  }
}


//
// 使用数据库保存日志
//
function use_local_db_log(parm) {
  var rc         = parm.rc, 
      tbegin     = parm.tbegin, 
      runtimeid  = parm.runtimeid, 
      instanceid = parm.instanceid, 
      __ext      = parm.__ext;

  //
  // exlog : 
  // begin   -- 任务开始
  // end     -- etl 任务结束
  // err     -- 错误日志, 不同系统, 参数不同
  // cnt     -- etl 报告读取行数
  // srv_beg -- esb 服务启动
  // srv_end -- esb 服务结束
  //
  var exlog = {
    begin   : __null('begin'),
    end     : __null('end'),
    err     : __null('err'),
    cnt     : __null('cnt'),
    srv_beg : __null('srv_beg'),
    srv_end : __null('srv_end'),

    det     : det,
    sta     : sta,
  };

  sw_ex_log();
  h2.init_detail_log(runtimeid, tbegin, rc, instanceid);
  exlog.begin(tbegin);


  function det(parm) {
    h2.log(runtimeid, rc, parm.his);
    // logger.log(runtimeid, rc.name, parm.his.tname, parm.his.msg);
  }

  function sta(parm) {
    h2.sta(runtimeid, tbegin, parm.tend, rc, parm.msg_arr, instanceid);
    exlog.end(parm.tend);
    // logger.log(runtimeid, tbegin, parm.tend, rc.name, parm.msg_arr);
  }

  function sw_ex_log() {
    switch (rc.className) {
    case ETL:
      // 测试时没有 __ext 参数
      if (__ext) extend(exlog, ext_db_log_etl(runtimeid, instanceid, __ext));
      break;

    case ESB:
      extend(exlog, ext_db_log_esb(rc.rid, instanceid));
      break;

    default:
      biz.error('Unknow sw_ex_log', rc.className);
    }
  }

  return exlog;
}


//
// 扩展业务日志 ETL
//
function ext_db_log_etl(runtimeid, instanceid, __ext) {
  var ret = {
    begin   : begin,
    end     : end,
    err     : err,
    cnt     : cnt,
  };

  var jobid = __ext.sche_id;
  var daqid = __ext.grp_id;


  function begin(time) {
    h2.etllog(runtimeid, instanceid, jobid, daqid, 1, 
              time, S0, N0, N0, N0);
  }

  function end(time) {
    h2.etllog(runtimeid, instanceid, jobid, daqid, 4, 
              time, S0, N0, N0, N0);
  }

  function err(parm) {
    h2.etllog(runtimeid, instanceid, jobid, daqid, 3, 
              parm.time, parm.msg, N0, parm.line, parm.rowdata);
  }

  function cnt(parm) {
    h2.etllog(runtimeid, instanceid, jobid, daqid, 2,
              parm.time, parm.msg, parm.row_count, N0, N0);
  }


  return ret;
}


//
// 扩展业务日志 ESB
//
function ext_db_log_esb(runtimeid, instanceid) {
  var ret = {
    err     : err,
    srv_beg : srv_beg,
    srv_end : srv_end,
  };


  function srv_beg(parm) {
    h2.esblog(parm.request_id, instanceid, 1, 
              runtimeid, parm.time, parm.msg);
  }

  function srv_end(parm) {
    h2.esblog(parm.request_id, instanceid, 4,
              runtimeid, parm.time, parm.msg);
  }

  function err(parm) {
    h2.esblog(parm.request_id, instanceid, 3, 
              runtimeid, parm.time, parm.msg);
  }

  return ret;
}


//
// child 会覆盖 parent 中的成员
// 参数不能空
//
function extend(parent, child) {
  for (var n in child) {
    parent[n] = child[n];
  }
}


function __null(name) {
  return function() {
    biz.info('Not log [', name, ']', arguments);
  }
}