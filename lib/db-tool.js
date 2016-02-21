var db      = require('db3-lib');
var logger  = require('logger-lib')('db-speed');


module.exports = {
  check_conn              : check_conn,
  init_db_config          : init_db_config,
  check_sql               : check_sql,
  select                  : select,
  update                  : update,
  filter_java_exception   : filter_java_exception,
  get_tables              : get_tables,
  get_fields              : get_fields,
  check_table_mapping     : check_table_mapping,
  createTable             : createTable,
  format_sql              : format_sql,
};

var SP = ' ';

var select_table = {
  'mysql'     : 'show tables',
  'oracle'    : 'select TABLE_NAME from user_tab_comments',
  'sqlserver' : "select name from sysobjects where xtype='U'"
};


//
// 检查连接是否正确, 失败调用 RCB(err), 成功, 如果设置 next 则调用
// 否则调用 RCB(null, message)
// next: Function(db_connect)
// RCB : Function(error, success_message)
//
function check_conn(configJSON, next, RCB) {
  var driver = db.createDriver(configJSON.conn);

  if (!RCB) {
    RCB = function(err) {
      console.log('error', err);
    }
  }

  driver.connect(function(err, connect) {
    if (err) {
      RCB({'retmessage': '连接失败, ' + filter_java_exception(err)});
      return;
    }

    if (next) {
      next(connect);
    } else {
      RCB(null, {'retmessage': "数据库连接成功"});
      connect.end();
    }
  });
}


//
// 在 configJSON 中附加 DB 配置
// 必须有配置: configJSON.conn
//
function init_db_config(configJSON) {
  configJSON.conn = {
    host     : 'localhost',
    user     : 'root',
    password : '',
    port     : '',
    database : '',
    driver   : 'mysql'
  };
}


//
// 检查 sql 是否能执行, 但不会修改数据
//
function check_sql(connect, sql, RCB) {
  connect.beginTran(function(err) {
    if (err) {
      return RCB({'retmessage': 'SQL 失败, ' + err.message});
    }

    select(sql, connect, 5, function(err, data) {
      if (err) {
        var msg = filter_java_exception(err);
        return RCB({'retmessage': 'SQL 失败, ' + msg});
      }

      RCB(null, {'retmessage': 'SQL 成功执行'});

      connect.rollback(function(err) {
        connect.end();
      });
    });

  });
}


//
// java 的错误会设置整个堆栈到 message 中, 过滤它
//
function filter_java_exception(err) {
  if (!err.message) return err;

  var msg = err.message;
  var f = _filter('java.sql', ':', 'at');

  if (!f) f = _filter('jdbc', ':', "\n");

  function _filter(begin_str, split_str, end_str) {
    var i = msg.indexOf(begin_str);
    if (i >= 0) {
      i = msg.indexOf(split_str, i);
      if (i > 0) {
        ++i;
        var e = msg.indexOf(end_str, i);
        if (e > i) {
          msg = msg.substring(i, e);
          return true;
        }
      }
    }
  }

  return msg;
}


//
// 包装一个 RCB 回调, 当出错时过滤错误信息
//
function java_err_rcb(rcb) {
  return function(err, d) {
    if (err) {
      rcb(filter_java_exception(err));
      return;
    }
    rcb(null, d);
  }
}


//
// 执行查询 sql, 返回数据, connect 在外面关闭
// _RCB(error, arr)
//
function select(sql, connect, limit, _RCB) {

  function RCB(err, succ) {
    if (_RCB) {
      _RCB(err, succ);
      _RCB = null;
    } else {
      console.error('why do second RCB ?', err, succ);
    }
  }

  connect.query(sql, function(query) {
    var data = { head:null, type:null, rows:[] };

    query.onMeta(function(meta) {
      var head = [];
      var type = [];

      meta.forEach(function(m) {
        head.push(m.field);
        type.push(m.typename);
      });

      data.head = head;
      data.type = type;
    });

    if (limit > 0) {
      var r = 0;

      query.onData(function(row) {
        if (++r > limit) {
          query.end();
        }
        try {
          data.rows.push(row);
        } catch(err) {
          RCB(err);
        }
      });

    } else {

      query.onData(function(row) {
        try {
          data.rows.push(row);
        } catch(err) {
          RCB(err);
        }
      });
    }

    query.onEnd(function() {
      RCB(null, data);
    });

    query.onErr(function(err) {
      RCB(err);
    });
  });
}



//
// 执行一个 sql 返回原始数据
// !! limit 默认为 20 [不再使用]
//
// _RCB: Function(err, data, meta)
// meta:
// data:
//
function update(sql, connect, _RCB, limit) {
  // console.log('QUERY:', sql);

  function RCB(err, data, meta) {
    _RCB && _RCB(err, data, meta);
    _RCB = null;
  }

  connect.query(sql, function(query) {
    var meta = null, data = [];

    query.onMeta(function(_meta) {
      meta = _meta;
    });

    query.onData(function(row) {
      data.push(row);
    });

    query.onEnd(function() {
      RCB(null, data, meta);
    });

    query.onErr(function(err) {
      RCB(err);
    });
  });
}


//
// RCB: Function(err, data)
// data: { meta:Object, data:Array }
//
function get_tables(configJSON, RCB) {
  check_conn(configJSON, function(connect) {
    var sql = select_table[ configJSON.conn.driver ];

    update(sql, connect, function(err, data, meta) {
      RCB(err, { meta:meta, data:data });
      connect.end();
    }, 999);
  }, RCB);
}


//
// RCB: Function(err, data)
// err : { retmessage:String }
// data: { retmessage:String, fields:Array }
//
function get_fields(configJSON, table, RCB) {
  check_conn(configJSON, function(connect) {
    connect.beginTran(function(err) {
      var sql = [];
      sql.push('select * from');
      sql.push(configJSON.table);
      sql.push('where 1>2');

      update(sql.join(SP), connect, function(err, data, meta) {
        connect.rollback(function() {
          connect.end();
        });

        if (err) {
          var msg = filter_java_exception(err);
          return RCB({'retmessage': '获取字段失败,' + msg});
        }

        RCB(null, {'retmessage': '成功', 'fields': meta});
      }, 999);

    });
  }, RCB);
}


//
// RCB: Function(err, data)
// err : { retmessage:String }
// data: { retmessage:String }
//
function check_table_mapping(conf, table, mapping, RCB) {
  check_conn(conf, function(connect) {
    connect.beginTran(function(err) {
      var sql = [];
      sql.push('select');

      for (var t in mapping) {
        sql.push( t );
        sql.push(',');
      }

      if (sql.length < 2) {
        return RCB({'retmessage': '必须配置字段映射'});
      }

      // 弹出末尾的逗号, 所以逗号要单独 push
      sql.pop();

      sql.push('from');
      sql.push(table);
      sql.push('where 1>2');

      update(sql.join(SP), connect, function(err, data, meta) {
        connect.rollback(function() {
          connect.end();
        });

        if (err) {
          var msg = filter_java_exception(err);
          return RCB({'retmessage': '表错误或映射无效, ' + msg});
        }

        RCB(null, {'retmessage': '成功'});
      });

    });
  }, RCB);
}


//
// 如果中间有错误, 继续执行, 但是无法正确运行
//
function createTable(dbconn, ddl_arr) {
  var i = -1;
  var conf = { conn: dbconn };

  check_conn(conf, function(connect) {
    loop(connect);
  }, function(err) {
    console.error('Cannot connect to', conf);
  });


  function loop(connect) {
    if (++i >= ddl_arr.length) {
      connect.end();
      return;
    }

    var sql = format_sql( ddl_arr[i] );

    update(sql, connect, function(err, data, meta) {
      console.log("\n>>>>> SQL: \n", sql);
      if (err) {
        console.log("- !", err);
      } else {
        console.log("- -", data, meta || '');
      }
      loop(connect);
    });
  }
}


function format_sql(_in) {
  var TAB_CH = '  ';
  var out    = [];
  var sp     = 0;
  var tab    = 0;

  for (var i=0, e=_in.length; i < e; ++i) {
    var c = _in[i];
    if (c == "\n") { continue; }
    if (c == "\t") { c = ' '; }
    if (c == ' ') {
      if (++sp > 1) { continue; }
    } else { sp = 0; }

    out.push(c);

    if (c == ',') {
      out.push("\n");
      push_tab();
    } else if (c == '(') {
      var ss = _in.indexOf(')', i);
      if ((ss >=0) && (ss - i > 8)) {
        out.push("\n");
        ++tab;
        push_tab();
      }
    }
  }

  function push_tab() {
    for (var i=tab; i>0; --i) {
      out.push(TAB_CH);
    }
  }

  return out.join('');
}