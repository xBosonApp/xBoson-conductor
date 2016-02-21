var http  = require('http');
var conf2 = require('configuration-lib').load();


module.exports = {
  asyn_loop_arr       : asyn_loop_arr,
  call_zy             : call_zy,
  reg_node_to_user    : reg_node_to_user,
  get_node_with_user  : get_node_with_user,
};


//
// 在异步中循环 arr, loopcb 结束后必须调用 next
// 用错误调用 next(err) 会导致立即结束, 并调用 overcb(err)
// loopcb : Function(object, index, next)
// overcb : Function(err);
//
function asyn_loop_arr(arr, loopcb, overcb) {
  var i = -1;

  try {
    _next();
  } catch(err) {
    overcb(err);
  }

  function _next() {
    if (++i < arr.length) {
      loopcb(arr[i], i, function(err) {
        if (err) return overcb(err);
        setImmediate(_next);
      });
    } else {
      overcb();
    }
  }
}


//
// 使集群节点与用户关联, 如果未启用平台或安全, 则立即返回
//
function reg_node_to_user(userid, nodeid, rcb) {
  if (!(conf2.eeb_zy.use_auth && conf2.eeb_zy.has_zy_server))
    return rcb();

  call_zy('addmapping', {
    app : 'bf1d70edb9d6463d968a175ce7a6fd3a',
    mod : 'user_node',
    org : 'a297dfacd7a84eab9656675f61750078',
    userid : userid,
    nodeid : nodeid,
  }, rcb);
}


//
// 获取与用户关联的集群节点
//
function get_node_with_user(openid, rcb) {
  if (!(conf2.eeb_zy.use_auth && conf2.eeb_zy.has_zy_server))
    return rcb();

  call_zy('getmapping', {
    app : 'bf1d70edb9d6463d968a175ce7a6fd3a',
    mod : 'user_node',
    org : 'a297dfacd7a84eab9656675f61750078',
    openid : openid,
  }, rcb);
}


//
// 方便调用平台接口
//
function call_zy(api, parms, rcb) {
  var url = [ 'http://', conf2.eeb_zy.ip, ':', conf2.eeb_zy.port,  
              '/ds/api/', api, '?sys=', conf2.eeb_zy.sys ];

  var _ = function(t) { url.push(t); return _; };

  for (var n in parms) {
    _('&')(n)('=')(parms[n]);
  }

  url = url.join('');
  // console.log(url);

  http.get(url, function(resp) {
    var bufs = [];

    resp.on('data', function (chunk) {
      bufs.push(chunk);
    });

    resp.on('end', function() {
      try {
        var data = JSON.parse( Buffer.concat(bufs).toString() );
        if ( Number(data.ret) ) {
          return rcb(new Error(data.msg));
        }
        rcb(null, data);
        
      } catch(err) {
        rcb(err);
      }
    });
  }).on('error', rcb);
}