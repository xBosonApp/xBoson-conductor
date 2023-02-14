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
var dbtool = require('./db-tool.js');
var tl     = require('./tool.js');
var util   = require('util');
var db3    = require('db3-lib');
var uuid   = require('uuid-zy-lib');
var conf   = require('configuration-lib').load();
var logger = require('logger-lib')('db');


var dbconf = conf.eeb_zy.log_db;
dbconf.tmpdir = conf.eeb_zy.local_db_dir + '/log_cache';

var connpool  = db3.create_conn_pool(dbconf, 1, 5, 10000);

//
// 数据库持久化, 注意查询列全部大写
// 虽然起名 h2 实际使用 mysql
//
module.exports = {
  create_clu      : create_clu,
  modify_clu      : modify_clu,
  remove_clu      : remove_clu,
  list_clu        : list_clu,
  clu_id2name     : clu_id2name,

  log             : log,
  sta             : sta,
  getlog          : getlog,
  etllog          : etllog,
  esblog          : esblog,

  init_job        : init_job,
  job_list        : job_list,
  job_change_attr : job_change_attr,
  job_create      : job_create,
  job_delete      : job_delete,

  new_node_conn   : new_node_conn,
  node_disconn    : node_disconn,
  node_list       : node_list,
  clean_node_list : clean_node_list,

  sche_list       : sche_list,
  sche_modify     : sche_modify,
  sche_add        : sche_add,
  sche_del        : sche_del,
  sche_get        : sche_get,

  varnish_list    : varnish_list,
  varnish_add     : varnish_add,
  varnish_del     : varnish_del,
  varnish_mod     : varnish_mod,

  init_detail_log : init_detail_log,
  format_num      : NL,
  create_offline  : create_offline,
};// xsw2@1qaz


// ---- /////////////////////////////////////////////////////////////////-//
// >>>> 日志

// 不重复的id, 后插入的要更大
var INTIME = Date.now();
var offlinedb = create_offline(dbconf);

//
// 写入操作详细日志
// runtimeid  -- 运行时
// rc         -- 配置信息, 从中取数据
// his        -- 历史记录对象
//
function log(runtimeid, rc, his) {
  var sql = "insert into sys_eeb_detail ( \
                      runid, rid,  time, rcname, pname, tname, msg,  data, INTIME) \
             values ('%s',  '%s', '%s',  '%s',  '%s',  '%s',  '%s', '%s',  %d)";

  sql = util.format(sql, runtimeid, rc.rid, date_format(his.time),
                    rc.name, N(his.pname), N(his.tname), 
                    N(safe_sql(his.msg ), 2000), 
                    N(safe_sql(his.data), 2000), ++INTIME );

  offlinedb.update(sql);
}


//
// 创建一条概览数据
//
function init_detail_log(runtimeid, tbegin, rc, instanceid) {
  var sql = "insert into sys_eeb_statistics (runid, rid, iid, cid, tbegin, tend, name, msg) \
             values ('%s', '%s', '%s', '%s', '%s', null, '%s', '运行中...')";

  sql = util.format(sql, runtimeid, rc.rid, instanceid, rc.clusterid, 
                    date_format(tbegin), rc.name);

  _do_update(sql, function(err) {
    if (err) console.log('! STA', err);
  });
}


//
// 写入概览日志
// tbegin     -- 开始时间, 毫秒值
// tend       -- 结束时间, 毫秒值
// rc         -- 作业配置
// msg_arr    -- 消息内容数组, 一条消息是一个元素
// instanceid -- 实例 ID
//
function sta(runtimeid, tbegin, tend, rc, msg_arr, instanceid) {
  var sql = "UPDATE sys_eeb_statistics SET tend = '%s', msg = '%s' WHERE runid = '%s'";

  sql = util.format(sql, date_format(tend), 
                    safe_sql( msg_arr.join('; ') ), runtimeid);

  offlinedb.update(sql);
}


//
// rcb     -- Function(err, reader)
// logtype -- 1:detail, 2:sys_eeb_statistics
//
function getlog(_key, logtype, page, page_size, rcb) {
  var where   = null;
  var cols    = null;
  var table   = null;
  var key_col = null;
  var order   = null;

  if (logtype == 1) {
    where   = "runid = '" + _key + "'";
    cols    = [ 'TIME', 'RCNAME', 'PNAME', 'TNAME', 'MSG', 'DATA'];
    table   = 'sys_eeb_detail';
    order   = 'INTIME';
  } else {
    where   = "rid = '" + _key + "'";
    key_col = 'RUNID'
    cols    = [ 'TBEGIN', 'TEND', 'NAME', 'MSG', key_col ];
    table   = 'sys_eeb_statistics';
    order   = 'TBEGIN desc, TEND desc';
  }

  _select(table, cols, page-1, page_size, where, order, _ret);

  function _ret(err, data) {
    if (err) return rcb(err);
    if (data) {
      var _d = data.data;

      for (var i=0, e=_d.length; i<e; ++i) {
        if (_d[i].TBEGIN) _d[i].TBEGIN = date_format(_d[i].TBEGIN);
        if (_d[i].TEND  ) _d[i].TEND   = date_format(_d[i].TEND  );
        if (_d[i].TIME  ) _d[i].TIME   = date_format(_d[i].TIME  );
      }
    }

    _pack_html(cols, key_col, rcb)(err, data);
  }
}


//
// 扩展统计日志
//
// jobid      -- 计划任务
// daqid      -- 采集点    
// event_type -- 01 开始时间, 02 处理数, 03 失败, 04 结束时间
// datetime   -- 日志生成时间
// msg        -- 消息字符串
// _row_count -- 处理行数
//
// 当出错日志时需要的参数
// _line_num  -- 出错行号
// _log_data  -- 出错数据
//
function etllog(runtimeid, instanceid, jobid, daqid, event_type, 
                datetime, msg, _row_count, _line_num, _log_data) {

  var table = dbconf.extlog.t_sta;
  var createdt = date_format(Date.now());

  var modul = { 
    logid         : uuid.v1(), 
    log_date_char : date_8_str(datetime), 
    log_time_char : time_6_str(datetime), 
    instanceid    : instanceid, 
    daqid         : daqid,
    jobid         : jobid,
    runningid     : runtimeid, 
    event_type    : NL(event_type, 2), 
    log           : msg, 
    cnt           : __num(_row_count),
    data_row      : __num(_line_num),
    createdt      : createdt
  };

  var sql = gen_insert(table, modul);
  offlinedb.update(sql);
  data_log();


  function data_log() {
    if (event_type != 3) return;

    var table = dbconf.extlog.t_dat;
    var modul = { 
      runningid   : runtimeid, 
      data_row    : _line_num,
      log_data    : _log_data,
      createdt    : createdt,
    };

    sql = gen_insert(table, modul);
    offlinedb.update(sql);
  }
}


//
// `runningid` -- '服务被请求生成id',
// `serviceid` -- '流的主键',
//
function esblog(runningid, instanceid, event_type, 
                serviceid, datetime, msg) {

  var table = dbconf.extlog.s_sta;
  var createdt = date_format(Date.now());

  var modul = { 
    logid         : uuid.v1(), 
    log_date_char : date_8_str(datetime), 
    log_time_char : time_6_str(datetime), 
    instanceid    : instanceid, 
    serviceid     : serviceid,
    runningid     : runningid, 
    event_type    : NL(event_type, 2), 
    log           : msg,
    createdt      : createdt
  };

  var sql = gen_insert(table, modul);
  offlinedb.update(sql);
}


// ---- /////////////////////////////////////////////////////////////////-//
// >>>> 作业管理


function init_job(job, workid, rcb) {
  var table = 'sys_eeb_run_conf';
  var modul = { id: job.rid, name: job.name, wid: workid, type: job.type };

  insert_when_update_no(upsql, insql, rcb);

  function upsql() {
    return gen_update(table, modul, 
           "id='" + job.rid 
           + "' and wid='" + workid + "'");
  }

  function insql() {
    return gen_insert(table, modul);
  }
}


function job_list(_where, page, page_size, rcb) {
  var table   = 'sys_eeb_run_conf';
  var cols    = [ 'ID', 'NAME', 'WID' ];
  var where   = parse_where(_where, 'and', {WID:w_eq, type:w_eq});
  var order   = 'name';

  _select(table, cols, page, page_size, where, order, function(err, data) {
    if (err) return rcb(err);
    rcb(null, data);
  });
}


function job_change_attr(data, rcb) {
  var table = 'sys_eeb_run_conf';
  var model = { name: data.name };
  // if (data.gid) model.GID = data.gid;

  var sql = gen_update(table, model, "id='" + data.id + "'");
  _do_update(sql, rcb, true);
}


function job_create(rc, workid, rcb) {
  var table = 'sys_eeb_run_conf';
  var modul = { id: rc.rid, name: rc.name, wid: workid, type: rc.className };
  var sql   = gen_insert(table, modul);
  _do_update(sql, rcb);
}


function job_delete(rid, rcb) {
  var sql = "DELETE FROM sys_eeb_run_conf where ID='" + rid + "'";
  _do_update(sql, rcb);
}


// ---- /////////////////////////////////////////////////////////////////-//
// >>>> ETL 计划任务管理

var sche_type = {
  '10' : '立即执行', '20' : '一次性任务', '30' : '每年',
  '31' : '每月',     '40' : '每周',       '50' : '每日',  '60' : '每几天',
  '70' : '每几小时', '80' : '每几分钟',   '90' : '每几秒'
};


function sche_config_to_model(data, rcb) {
  if (!(data.scheduleid && data.__rid && data.schedulenm)) {
    return rcb(new Error('参数错误'));
  }

  rcb(null, {
    id            : data.scheduleid,
    rid           : data.__rid,
    gid           : data.__gid,
    vid           : data.__vid,
    name          : data.schedulenm,
    task_time     : (data.task_date || '') + ' ' + data.task_time,
    cycle         : data.schedule_cycle,
    run_times     : data.run_times,
    run_end_time  : data.run_end_time,
    intervall     : data.schedule_interval,
    json          : JSON.stringify(data),
  });
}


function sche_modify(data, rcb) {
  var table = 'sys_eeb_sche';
  sche_config_to_model(data, function(err, model) {
    if (err) return rcb(err);
    var sql = gen_update(table, model, "id='" + model.id + "'");
    _do_update(sql, rcb, true);
  });
}


function sche_add(data, rcb) {
  var table = 'sys_eeb_sche';
  sche_config_to_model(data, function(err, model) {
    if (err) return rcb(err);
    var sql = gen_insert(table, model);
    _do_update(sql, rcb);
  });
}


function sche_del(id, rcb) {
  var sql = "DELETE FROM sys_eeb_sche where ID='" + id + "'";
  _do_update(sql, rcb, true);
}


function sche_list(_where, pagenum, psize, rcb) {
  var table      = 'sys_eeb_sche t';
  var cols       = [ 'ID', 'RID', 'NAME', 'TASK_TIME', 'CYCLE', 'GID', 'VID',
                     '(select name from sys_eeb_run_conf where id=rid) as RNAME',
                     '(select name from sys_eeb_varnish  where vid=t.vid) as VNAME' ];
  var where_plot = { rid: w_eq, wid: _wid, id: w_eq, type: w_non };
  var where      = parse_where(_where, 'and', where_plot);
  var order      = 'RNAME, NAME';

  _select(table, cols, pagenum, psize, where, order, function(err, data) {
    // console.log(this.sql)
    if (err) return rcb(err);

    if (data && data.data) {
      data.data.forEach(function(r, i) {
        r.CYCLE = sche_type[ r.CYCLE ];
      });

      clu_id2name(data.data, function(err) {
        if (err) return rcb(err);
        rcb(null, data);
      });
    }
  });

  function _wid(n, v) {
    return "rid in ( select id from sys_eeb_run_conf where type=1 and wid='" 
           + _where.wid + "')";
  }
}


function sche_get(id, rcb) {
  var table = 'sys_eeb_sche';
  var cols  = [ 'ID', 'JSON' ];
  var where = "id='" + id + "'";

  _select(table, cols, 0, 1, where, null, function(err, data) {
    rcb(err, data.data[0].JSON || {});
  });
}


// ---- /////////////////////////////////////////////////////////////////-//
// >>>> 集群管理


function new_node_conn(msg, rcb) {
  var table = 'sys_eeb_work_node';
  var model = { id: msg.id, state: 1, ip: msg.ip, host: msg.host, 
                port: msg.port, info: msg.os};

  insert_when_update_no(upsql, insql, rcb);

  function upsql() {
    return gen_update(table, model, "id='" + msg.id + "'");
  }

  function insql() {
    return gen_insert(table, model);
  }
}


function node_disconn(msg) {
  var table = 'sys_eeb_work_node';
  var model = { LASTOUT: date_format(Date.now()), state: 0 };
  var sql   = gen_update(table, model, "id='" + msg.id + "'");

  _do_update(sql, function(err, arow) {
    if (err) throw err;
  }, true);
}


function node_list(_where, page, page_size, rcb) {
  var table   = 'sys_eeb_work_node';
  var cols    = [ 'ID', 'STATE', 'IP', 'HOST', 'PORT', 'INFO', 'LASTOUT' ];
  var where   = parse_where(_where, 'and', { ID:w_in });
  var order   = 'state desc';

  _select(table, cols, page, page_size, where, order, function(err, data) {
    if (data) {
      var _d = data.data;
      for (var i in _d) {
        _d[i].STATE   = Number(_d[i].STATE) ? '在线' : '离线';
        _d[i].LASTOUT = date_format(_d[i].LASTOUT);
      }
    }
    rcb(err, data);
  });
}


// 初始化时, 全部离线
function clean_node_list(rcb) {
  var sql = "UPDATE sys_eeb_work_node SET STATE=0";
  _do_update(sql, rcb, true);
}


// ---- /////////////////////////////////////////////////////////////////-//
// >>>> 采集点管理


function create_clu(name, id, wid, rcb) {
  var sql = "insert into sys_eeb_jobgroup (ID, NAME, TYPE, WID) \
             values ('%s', '%s', 0, '%s')";
  sql = util.format(sql, id, name, wid);
  _do_update(sql, rcb);
}


function modify_clu(name, id, wid, rcb) {
  var sql = "UPDATE sys_eeb_jobgroup SET NAME='%s', WID='%s' WHERE ID='%s'";
  sql = util.format(sql, name, wid, id);
  _do_update(sql, rcb);
}


function remove_clu(id, rcb) {
  var sql = "DELETE FROM sys_eeb_jobgroup WHERE ID='%s'";
  sql = util.format(sql, id);
  _do_update(sql, rcb);
}


function list_clu(where, pnum, size, rcb) {
  where = parse_where(where);
  _select('sys_eeb_jobgroup', ['ID', 'NAME', 'WID'], 
          pnum, size, where, 'wid, name', _ret);

  // 附加 WINFO 字段描述节点信息
  function _ret(err, d) {
    if (err) return rcb(err);

    connpool.get(function(err, connect) {
      if (err) return rcb(err);
      tl.asyn_loop_arr(d.data, _loop, _loop_over);

      function _loop(r, index, next) {
        var sql = "select concat(host, ' / ', ip) AS WINFO from \
                   sys_eeb_work_node where ID='" + r.WID + "'";
                   
        dbtool.update(sql, connect, function(err, rows, meta) {
          r.WINFO = rows[0] && rows[0].WINFO;
          next(err);
        });
      }

      function _loop_over(err) {
        rcb(err, d);
        connect.end();
      }
    });
  }
}


function clu_id2name(data_arr, rcb) {
  var i = -1;

  // 附加 GNAME 字段, 描述采集点信息
  connpool.get(function(err, connect) {
    if (err) return rcb(err);
    tl.asyn_loop_arr(data_arr, _loop, _loop_over);

    function _loop(r, index, next) {
      if (!r.GID) return next();
      var sql = "select NAME from sys_eeb_jobgroup where ID='" + r.GID + "'";

      dbtool.update(sql, connect, function(err, rows, meta) {
        r.GNAME = rows[0] && rows[0].NAME;
        next(err);
      });
    }

    function _loop_over(err) {
      rcb(err);
      connect.end();
    }
  });
}


// ---- /////////////////////////////////////////////////////////////////-//
// >>>> 特例配置管理


function varnish_list(_where, pnum, size, rcb) {
  var table   = 'sys_eeb_varnish t2';
  var cols    = [ 'NAME', 'VID', 'RID', 'WID', 
                  '(select name from sys_eeb_run_conf  where id=t2.rid  ) as RNAME ' ];
  var where   = parse_where(_where, 'and');
  var order   = 'NAME desc';

  _select(table, cols, pnum, size, where, order, function(err, data) {
    rcb(err, data);
  });
}


function varnish_add(model, rcb) {
  var table = 'sys_eeb_varnish';
  model.vid = uuid.v1();
  var sql = gen_insert(table, model, [ 'name', 'vid', 'rid', 'wid' ]);
  _do_update(sql, rcb);
}


function varnish_mod(model, vid, rcb) {
  var table = 'sys_eeb_varnish';
  var where = "vid = '" + vid + "'";
  var sql   = gen_update(table, model, where);
  _do_update(sql, rcb, true);
}


function varnish_del(vid, rcb) {
  var sql = "DELETE FROM sys_eeb_varnish WHERE VID='%s'";
  sql = util.format(sql, vid);
  _do_update(sql, rcb);
}


// ---- /////////////////////////////////////////////////////////////////-//
// >>>> 工具函数 ! 之后把这些常用工具迁移到 db3 中

//
// 暂时未用 !!!
//
function create_page_cache() {
  var max_size  = 30;
  var map       = {};
  var arr       = [];
  var ai        = 0;

  var ret = {
    save : save,
    get  : get,
  };

  function get(key) {
    var i = map[key];
    if (i) {
      return arr[i];
    }
  }

  function save(key, pageobj) {
    if (map[key]) return;
    arr[ai ] = pageobj;
    map[key] = ai;
    if (++ai >= max_size) ai = 0;
  }

  return ret;
}


//
// 查询表, 支持分页和条件, 回调数据中附加 __RNUM 行计数器
//
// table   -- 表名
// col_arr -- 列数组
// pnum    -- 当前页码, 0开始
// size    -- 一页的行数
// where   -- where 字符串
// _order  -- 排序字段
// rcb     -- 回调 Function(err, data), this.sql 可以查看查询语句
//
function _select(table, col_arr, pnum, size, _where, _order, rcb) {
  connpool.get(function(err, connect) {
    if (err) return rcb(err);

    var where = _where || '1=1';
    var order = _order ? ('ORDER BY ' + _order) : '';

    var sql = util.format('select %s from %s WHERE %s %s LIMIT %d OFFSET %d', 
                          col_arr.join(', '), table, where || '1=1', order,
                          size, pnum * size);

    var psql = util.format('select count(1) as TOTAL from %s WHERE %s', 
                           table, where);
    

    dbtool.update(sql, connect, function(err, rows, meta) {
      if (err) return _rcb(err);

      for (var i=0, e=rows.length; i<e; ++i) 
        rows[i].__RNUM = i;

      dbtool.update(psql, connect, return_select);


      function return_select(_err, page, _) {
        if (_err) return _rcb(_err);
      
        //
        // 这里决定返回数据类型的结构
        //
        _rcb(null, {
          data : rows,
          ext  : {
            meta       : meta,
            pagination : {
              total : Number(page[0].TOTAL),
              curr  : pnum,
              size  : size
            }
          }
        });
      }

      function _rcb(err, data) {
        connect.end();
        rcb.call({ sql:sql, where:where }, err, data);
      }

    });
  });
}


//
// 更新
//
function _do_update(sql, rcb, nochange_noerror) {
  connpool.get(function(err, connect) {
    if (err) return rcb(err);

    connect.update(sql, function(err, affectedRows) {
      if (err) rcb(err);
      else {
        if (affectedRows < 0) {
          rcb(new Error('不是有效的更新'));
        } else if (affectedRows > 0 || nochange_noerror) {
          rcb(null, affectedRows);
        } else {
          rcb(new Error('没有数据被更新'));
        }
      }
      connect.end();
    });

    // dbtool.update(sql, connect, function(err, data, meta) {
    //   if (err) {
    //     rcb(err);
    //   }
    //   else {

    //     if (data.length > 0) {
    //       if (data[0].affectedRows > 0 || nochange_noerror) {
    //         rcb(null, data[0].affectedRows);
    //       } else {
    //         rcb(new Error('没有数据被更新'));
    //       }
    //     } else {
    //       rcb(new Error('不是有效的更新'));
    //     }

    //   }
    //   connect.end();
    // });
  });
}


//
// 包装数据库返回的数据为 html 代码返回给客户端
// 返回的结构兼容 local-data.js->getlog()
//
function _pack_html(cols, key_col, rcb) {
  return function(err, data) {
    if (err) return rcb(err);

    var html = [], _ = function(s) { html.push(s); return _; };
    var rows = data.data;
    var v;

    rows.forEach(function(r) {
      _('<tr tkey="')( key_col && r[key_col] )('">');

      for (var i=0; i<cols.length; ++i) {
        if (cols[i] == key_col) continue;
        _('<td>');
        var v = r[cols[i]];
        v && _( String(v) );
        _('</td>');
      }

      _('</tr>');
    });

    var cpage = data.ext.pagination.total / data.ext.pagination.size;

    if (cpage % 1 > 0) {
      cpage = parseInt(cpage) + 1;
    }

    rcb(null,  {
      html  : html.join(''),
      cpage : cpage
    });
  }
}


//
// 生成 insert 语句, 当属性值为 null, 则插入 null
// table - 表名称
// model - { 数据库列名: 值 }
// _col  - [ 可选的, 限定列 ]
//
function gen_insert(table, model, _col) {
  var head = [ 'INSERT into ', table, ' (', '3-clos', ") values ( ", '5-vals', " )" ];
  var cols = [];
  var vals = [];
  var v;

  if (_col) {
    var tmp = {};
    _col.forEach(function(c) {
      tmp[c] = model[c];
    });
    model = tmp;
  }

  for (var name in model) {
    cols.push(name);
    v = model[name];
    if (v === null) {
      vals.push('null');
    } else {
      vals.push("'" + safe_sql( v ) + "'");
    }
  }

  head[3] = cols.join(', ');
  head[5] = vals.join(", ");

  return head.join('');
}


function gen_update(table, model, where) {
  var head = [ 'Update ', table, ' SET ', '3-sets' ];
  var sets = [];

  for (var name in model) {
    sets.push(name);
    sets.push("='");
    sets.push(safe_sql( model[name] ));
    sets.push("'");
    sets.push(', ');
  }
  sets.pop();

  head[3] = sets.join('');

  if (where) {
    head.push(' WHERE ');
    head.push(where);
  }

  return head.join('');
}


//
// 从查询字符串中解析 where, 并组装到 sql 的 where 子句中
// query 中的查询条件放在 where 属性中
// link_type -- 多个查询条件的连接方式, 默认 or
// where_plot -- columnName : Function(name, val) 比较策略, 返回字符串
// 比较策略默认使用 like
// where_str -- 可以是查询字符串, 或 js 对象
//
function parse_where(where_str, link_type, where_plot) {
  var where;
  if (!link_type) link_type = 'or';
  if (!where_plot) where_plot = {};

  try {
    var w;
    if (typeof where_str == 'string') {
      w = JSON.parse(where_str);
    } else {
      w = where_str;
    }
    where = [];

    for (var n in w) {
      if (!w[n]) continue;
      where.push(' ');
      if (where_plot[n]) {
        where.push( where_plot[n](n, w[n]) );
      } else {
        where.push( defaultPlot(n, w[n]) );
      }
      where.push(' ');
      where.push(link_type);
    }
    where.pop();
    where = where.join('');
  } catch(err) { }
  
  //
  // 默认比较策略
  //
  function defaultPlot(n, v) {
    return n + " like '%" + safe_sql( w[n] ) + "%' ";
  }

  // console.log('where', where)
  return where;
}


//
// 先更新, 没有数据更新则插入
//
function insert_when_update_no(getUpdate, getInsert, rcb) {
  _do_update(getUpdate(), function(err, arow) {
    if (err) return rcb(err);
    if (arow < 1) {
      _do_update(getInsert(), function(err, arow) {
        if (err) return rcb(err);
        rcb();
      });
    } else {
      rcb();
    }
  }, true);
}


function date_format(data_val_int) {
  // yyyy-MM-dd hh:mm:ss
  var d = new Date(data_val_int);
  return d.getFullYear()     + '-' + NL(d.getMonth()+1, 2) + '-' + NL(d.getDate(), 2) + ' '
       + NL(d.getHours(), 2) + ':' + NL(d.getMinutes(), 2) + ':' + NL(d.getSeconds(), 2);
}


function date_8_str(obj) {
  var d = new Date(obj);
  return d.getFullYear() + NL(d.getMonth()+1, 2) + NL(d.getDate(), 2);
}


function time_6_str(obj) {
  var d = new Date(obj);
  return NL(d.getHours(), 2) + NL(d.getMinutes(), 2) + NL(d.getSeconds(), 2);
}


// 保证含有 ' 符号的字符串可以插入 sql 中
// ! 暂时粗暴的去掉所有的 ' 符号
function safe_sql(s) {
  return s && String(s).replace(/'/g, "");
}


// 保证输出的数字为 l 位, 当前 l<=4
// 这个函数尽可能保证速度
function NL(n, l) {
  var t = 0;

       if (n < 10   ) t = 1; 
  else if (n < 100  ) t = 2;
  else if (n < 1000 ) t = 3;
  else if (n < 10000) t = 4;

  switch(l-t) {
    case 3: return '000' + n;
    case 2: return '00' + n;
    case 1: return '0' + n;
    case 0: return n + '';
    default: return n;
  }
}


// 空对象正确的插入数据库
function N(s, max_length) {
  if (s) {
    if (max_length > 0) {
      if (s.length >= max_length) {
        s = s.substr(0, max_length-1);
      }
    }
    return s;
  } else {
    return '';
  }
}


// sql where, '=' 比较
function w_eq(n, v) {
  return n + "='" + v + "'";
}


// sql where, 'in' 比较, v 必须是数组
function w_in(n, v) {
  return n + " in ('" + v.join("', '") + "')";
}


// sql where, 忽略这个比较
function w_non(n, v) {
  return "1=1";
}


// n 非数字返回 null, 否则返回 n
function __num(n) {
  return isNaN(n) ? null : n;
}


function create_offline(dbconf) {
  var off = db3.offline(dbconf);
  
  off.on('error', function(err) {
    logger.error('日志 db', err);
  });

  off.on('wover', function(inf) {
    logger.log('日志 写出完成, 进程:', inf.pid, ', 数据行:', inf.count);
  });

  off.on('wbegin', function(inf) {
    logger.log('日志 开始任务进程:', inf.pid, ', 数据行:', inf.count);
  });

  off.on('retry', function(inf) {
    logger.log('日志 连接重试重试, 进程:', inf.pid,
                '重试次数:', inf.recont, '出错原因:', inf.err.message);
  });

  return off;
}