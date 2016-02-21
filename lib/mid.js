var h2          = require('./h2-data.js');
var nm          = require('./node-manager.js');
var tl          = require('./tool.js');
var local       = require('./local-db.js');

var logger      = require('logger-lib')('eeb');
var uuid        = require('uuid-zy-lib');
var querystring = require('querystring');
var config      = require('configuration-lib').load();
var net         = require('mixer-lib').util.net();

var service_address = 'http://localhost:' + config.port;
var zyconf          = config.eeb_zy;
var ONE_PAGE_SIZE   = 15;


module.exports = function() {

  // 绑定服务处理器; '服务名':处理函数
  var fn = {
    'nodelist'    : nodelist,
    'joblist'     : joblist,

    'rename2'     : rename2,
    'lhis'        : lhis,
    'uuid'        : getuuid,
    'getrc2'      : getrc2,
    'fp_get'      : fp_get,

    'schelist'    : schelist,
    'schedel'     : schedel,
    'schecreate'  : schecreate,
    'scheedit'    : scheedit,
    'scheget'     : scheget,
    '_start_sche' : _start_sche,

    'grp_new'     : grp_new,
    'grp_del'     : grp_del,
    'grp_mod'     : grp_mod,
    'grp_list'    : grp_list,

    'varnish_list': varnish_list,
    'varnish_new' : varnish_new,
    'varnish_mod' : varnish_mod,
    'varnish_del' : varnish_del,
    'load_vc'     : load_vc,
    'save_vc'     : save_vc,

    'testhttp'    : testhttp,
    'httptest'    : testhttp,
  };


  function __mid(req, resp, next) {
    if (typeof req.query.fn != 'string') {
      return errorHand(new Error('`fn` must not array'));
    }

    var process = fn[req.query.fn];

    if (process) {
      process(req, resp, errorHand, success);
    } else {
      proxy_node(req, resp, errorHand, success);
    }

    //
    // err -- new Error(...)
    //
    function errorHand(err) {
      var ret = {
        ret: 1, msg: err.message || err
      };
      resp.end(JSON.stringify(ret));
      // logger.error(err.message || err);
    }

    //
    // obj         -- 返回到客户端的数据 保存在 data 属性中
    // _direct_ret -- 如果 true, 则把 obj 不加包装直接返回, 并且 _ext_data 无效
    // _ext_data   -- 扩展数据 保存在 ext 属性中
    //
    function success(obj, _direct_ret, _ext_data) {
      var ret = null;
      if (_direct_ret) {
        ret = obj;
      } else {
        ret = {
          ret: 0, msg: null, data: obj || '成功',
          ext: _ext_data
        };
      }
      resp.end(JSON.stringify(ret));
    }
  }

  return __mid;
};


// 转换其中的参数并代理到对应的节点上
function fp_get(req, resp, errorHand, success) {
  var nodeid = req.query.nodeid;
  var _wnid  = req.query.wnid;

  if (nodeid) {
    nm.get_wnid(nodeid, _do);
  } else {
    _do(null, _wnid);
  }

  function _do(err, wnid) {
    if (err) return errorHand(err);
    req.query.wnid = wnid;
    proxy_node(req, resp, errorHand, success);
  }
}


function rename2(req, resp, errorHand, success) {
  h2.job_change_attr(req.query, function(err) {
    if (err) return errorHand(err);
    success();
  });
}


function getrc2(req, resp, errorHand, success) {
  local.load_rc(req.query.rid, false, function(err, rc) {
    if (err) return errorHand(err);
    success(rc);
  });
}


function joblist(req, resp, errorHand, success) {
  var pagenum = Number(req.query.pn) || 0;
  var psize   = req.query.all ? 999 : ONE_PAGE_SIZE;
  var where;

  try {         
    where = JSON.parse(req.query.where);
  } catch(e) {  where = {}; }
  
  where.type = req.query.t;

  get_wid(req.query.id, req.query.wnid, errorHand, do_select)
  
  function do_select(wid) {
    where.WID = wid;
    h2.job_list(where, pagenum, psize, 
      function(err, ret, total) {
        if (err) return errorHand(err);
        success(ret.data, null, ret.ext);
      });
  }
}


function nodelist(req, resp, errorHand, success) {
  var pagenum = Number(req.query.pn) || 0;
  var size    = ONE_PAGE_SIZE;
  var where;

  try {
    where = JSON.parse(req.query.where);
  } catch(e) {
    where = {};
  }

  if (pagenum < 0) {
    size = 9999;
    pagenum = 0;
  }

  if (req.__auth__) {
    tl.get_node_with_user(req.__auth__.openid, function(err, dat) {
      if (err) return errorHand(err);
      where.ID = dat.result;
      node_list();
    });
  } else {
    node_list();
  }


  function node_list() {
    h2.node_list(where, pagenum, size, function(err, ret, total) {
      if (err) errorHand(err);

      tl.asyn_loop_arr(ret.data, loop, over);

      function loop(r, i, next) {
        nm.get_wnid(r.ID, function(err, wnid) {
          r.wnid = wnid;
          next();
        });
      }

      function over() {
        success(ret.data, null, ret.ext);
      }
    });
  }
}


function grp_new(req, resp, errorHand, success) {
  var name = req.query.n;
  var wid  = req.query.w;
  var id   = uuid.v4();

  if (!name) return errorHand('名称无效');
  if (!wid)  return errorHand('集群节点无效');

  h2.create_clu(name, id, wid, function(err) {
    if (err) errorHand(err);
    success();
  });
}


function grp_del(req, resp, errorHand, success) {
  var id = req.query.i;

  h2.remove_clu(id, function(err) {
    if (err) errorHand(err);
    success();
  });
}


function grp_mod(req, resp, errorHand, success) {
  var name = req.query.n;
  var id   = req.query.i;
  var wid  = req.query.w;
  
  if (!name) return errorHand('名称无效');
  if (!wid)  return errorHand('集群节点无效');

  h2.modify_clu(name, id, wid, function(err) {
    if (err) errorHand(err);
    success();
  });
} 


function grp_list(req, resp, errorHand, success) {
  var pagenum = Number(req.query.pn) || 0;
  var all     = req.query.all;
  var psize   = all ? 999 : ONE_PAGE_SIZE;
  var wnid    = req.query.wnid;
  var where   = req.query.where;

  if (wnid) {
    nm.get_work_node_msg(wnid, function(err, msg) {
      where = where ? JSON.parse(where) : {};
      where.wid = msg.id;
      _do();
    });
  } else {
    _do();
  }

  function _do() {
    h2.list_clu(where, pagenum, psize, function(err, ret, total) {
      if (err) return errorHand(err);
      success(ret.data, null, ret.ext);
    });
  }
}


function schedel(req, resp, errorHand, success) {
  var id = req.query.id;
  h2.sche_del(id, function(err) {
    if (err) return errorHand(err);
    success();
  });
}


function schecreate(req, resp, errorHand, success) {
  easyBodyParse(req, errorHand, function(data) {
    data = JSON.parse(data);
    data.scheduleid = uuid.v4();
    h2.sche_add(data, function(err) {
      if (err) return errorHand(err);
      success();
    });
  });
}


function scheedit(req, resp, errorHand, success) {
  easyBodyParse(req, errorHand, function(data) {
    data = JSON.parse(data);
    h2.sche_modify(data, function(err) {
      if (err) return errorHand(err);
      success();
    });
  });
}


function scheget(req, resp, errorHand, success) {
  var id = req.query.id;
  if (id) {
    h2.sche_get(id, function(err, data) {
      if (err) return errorHand(err);
      success(data);
    });
  } else {
    errorHand('参数错误');
  }
}


function schelist(req, resp, errorHand, success) {
  var pagenum = Number(req.query.pn) || 0;
  var all     = req.query.all;
  var psize   = all ? 999 : ONE_PAGE_SIZE;
  var wnid    = req.query.wnid;
  var where;

  try {         
    where = JSON.parse(req.query.where);
  } catch(e) {  where = {}; }
  
  where.type = req.query.t;
  where.wid  = req.query.id;
  where.rid  = req.query.rid;

  if (where.wid) {
    _do();
  } else {
    nm.get_work_node_msg(wnid, function(err, msg) {
      where.wid = msg.id;
      if (where.wid) {
        _do();
      } else {
        errorHand('参数错误');
      }
    });
  }

  function _do() {
    h2.sche_list(where, pagenum, psize, function(err, ret) {
      if (err) return errorHand(err);
      success(ret.data, null, ret.ext);
    });
  }
}


function varnish_list(req, resp, errorHand, success) {
  var pagenum = Number(req.query.pn) || 0;
  var psize   = req.query.all ? 999 : ONE_PAGE_SIZE;
  var where;

  try {         
    where = JSON.parse(req.query.where);
  } catch(e) {  where = {}; }
  
  get_wid(req.query.wid, req.query.wnid, errorHand, _do);

  function _do(wid) {
    where.wid = wid;
    h2.varnish_list(where, pagenum, psize, function(err, ret) {
      if (err) return errorHand(err);
      success(ret.data, null, ret.ext);
    });
  }
}


function varnish_new(req, resp, errorHand, success) {
  var model = req.query;
  if (!model.name) return errorHand('名称无效');
  if (!model.rid) return errorHand('模板无效');
  get_wid(model.wid, model.wnid, errorHand, _do);

  function _do(wid) {
    model.wid = wid;
    delete model.wnid;
    h2.varnish_add(model, function(err) {
      if (err) return errorHand(err);
      local.new_varnish(model.vid, function(err) {
        if (err) return errorHand(err);
        success();
      });
    });
  }
}


function varnish_mod(req, resp, errorHand, success) {
  var model = { rid: req.query.rid, name: req.query.name };
  if (!model.name) return errorHand('名称无效');
  if (!model.rid) return errorHand('模板无效');
  
  h2.varnish_mod(model, req.query.vid, function(err) {
    if (err) return errorHand(err);
    success();
  });
}


function varnish_del(req, resp, errorHand, success) {
  var vid = req.query.vid;
  h2.varnish_del(vid, function(err) {
    if (err) return errorHand(err);
    local.del_varnish(req.query.vid);
    success();
  });
}


function load_vc(req, resp, errorHand, success) {
  local.get_varnish(req.query.vid, function(err, vconf) {
    if (err) return errorHand(err);
    success(vconf);
  });
}


function save_vc(req, resp, errorHand, success) {
  easyBodyParse(req, errorHand, function(data) {
    data = JSON.parse(data);
    local.save_varnish(data.vid, data.vc, function(err) {
      if (err) errorHand(err);
      success();
    });
  });
}


//
// 用于一个节点的作业启动另一个节点的作业
// 节点通过 http 请求这个方法, 这个方法通过 wid 路由到对应的节点上
// 并通过 ws 代理请求到对应节点的 sche_start http 方法
//
function _start_sche(req, resp, errorHand, success) {
  nm.get_wnid(req.query.wid, function(e, wnid) {
    if (!wnid) {
      errorHand(new Error('节点离线'));
      return;
    }
    req.query.wnid = wnid;
    req.query.id = req.query.jid;
    req.query.fn = 'sche_start';
    proxy_node(req, resp, errorHand, success)
  });
}


//
// 利用 wnid 属性区分不同的集群节点
//
function proxy_node(req, resp, errorHand, success) {
  var wnid = req.query.wnid;

  nm.get_work_node_msg(wnid, function(err, msg) {
    if (err) {
      logger.error('proxy_node', err.message);
      errorHand(err);
      return;
    }

    // 代理只解析 url 属性, 忽略 query 与 url 的不一致
    req.query.pss = msg.pss;
    req.url = msg.prefix + req.baseUrl + '?' + querystring.stringify(req.query);

    msg.direct_proxy(req, resp);
  });
}


//
// 直接返回 getlog 返回的数据
// http -- rid, lt, p
//
function lhis(req, resp, errorHand, success) {
  var rid     = req.query.rid;
  var logtype = Number(req.query.lt);
  var page    = req.query.p || 1;

  // data_src | h2
  h2.getlog(rid, logtype, page, ONE_PAGE_SIZE, function(err, data) {
    if (err) return errorHand(err);
    success(data);
  });
}


// 用来测试 http 请求, 其他什么也不做
// notlog 设置控制台不回显
function testhttp(req, resp, errorHand, success) {
  var notlog = req.query.notlog;
  notlog || console.log('query:', req.query);

  easyBodyParse(req, errorHand, function(_nul, str) {
    notlog || console.log('post body:', str);
    success(1);
  }, true);
}


// 客户端配合 postService
function easyBodyParse(req, errorHand, success, _not_json) {
  var buf = [];

  req.on('data', function(data) {
    buf.push(data);
  });

  req.on('end', function() {
    var str = Buffer.concat(buf).toString();
    var ret = _not_json || querystring.parse(str);
    success(ret.data, str);
  });
}


// 方便的工具服务
function getuuid(req, resp, errorHand, success) {
  success(uuid.v4());
}


function get_wid(wid, wnid, errorHand, getter) {
  if (wid) {
    getter(wid);
  } else {
    nm.get_work_node_msg(wnid, function(err, msg) {
      var _wid = msg.id;
      if (_wid) {
        getter(_wid);
      } else {
        errorHand('参数错误');
      }
    });
  }
}