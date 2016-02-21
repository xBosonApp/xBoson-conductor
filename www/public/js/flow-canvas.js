//
// 这个脚本是整个 EEB-UI 的核心, 同时负责与 Core 通讯
//
jQuery(document).ready(function($) {


// 图标文件起始目录
var b_icon      = 'img/target-icon/';
var HELP_DIR    = 'prog-help/';
var icon_size   = 55;
var GROUP_ITEM_SPACE = 3;

// 程序配置页起始目录
var b_config    = 'prog-config/';
var easy_dialog = eeb.easy_dialog;
var canvas      = $('.canvas_content');
var type        = $('#__page_class_name_type').html();
var rid         = $('#__page_run_config_id').html();
var namelable   = $('#__run_config_name');
var node_edit   = $('#__edit_select_node');
var node_dialog = $('#__node_config_dialog');
var edit_note   = $('#__edit_note_dialog');
var cover       = $('#__canvas_cover');
var progressbar = eeb.easy_progress();
var rc          = null;
var jtopo       = null;
var program     = {};
var __linkid    = 0;
var save_msg    = eeb.not_back_event();


// ESB 保留测试无意义
if (type == '2') $('#__save_and_test').remove();

// node 图形与 target 关联, 主键是 tid
var nodeOnTarget = {};

var ext_event = $('<span/>');
var ext_init_over_rcb;
window.eeb.init_flow_canvas = init_flow_canvas;


//
// 在外部调用该方法执行初始化, 不能重复调用 !
//
function init_flow_canvas(rcb) {
  if (ext_init_over_rcb) {
    return init_over();
  } else {
    ext_init_over_rcb = rcb;
  }

  node_edit.hide();
  init_node_dialog();
  read_program_list();
  watch_running_change();

  $('#__save_run_config').click(save_config);
  $('#__save_and_test').click(save_test_rc);
  $('#__save_and_invoke').click(save_invoke_rc);
  $('#__bt_history').click(updateHistoryDialog);
  $('#__bt_stop').click(stop_task);
}


function init_over() {
  progressbar.end();
  ext_init_over_rcb(_show_all, rc, jtopo, ext_event);

  function _show_all() {
    cover.fadeOut(function() {
      cover.remove();
    });
  }
}


// 调用这个方法回显状态
function log() {
  eeb.log.apply(null, arguments);
}


function init_note_dialog() {
  var openbutton = $('#__open_note_dialog');
  var ok         = edit_note.find('.ok');
  var cancle     = edit_note.find('.no');
  var text       = edit_note.find('textarea');
  var ew         = edit_note.width();
  var nulltxt    = '[便签]';

  edit_note.css({ opacity: 0.95 });
  text.val(rc.note_text || nulltxt);
  $(window).resize(repos);
  repos();

  cancle.click(function() {
    text.val(rc.note_text || nulltxt);
    edit_note.slideUp(100);
  });

  ok.click(function() {
    rc.note_text = text.val();
    edit_note.slideUp(100);
    save_msg.change();
  });

  openbutton.click(function() {
    edit_note.slideDown(230);
    repos();
    if (text.val() == nulltxt) {
      text.one('focusin', function() {
        text.val('');
      });
    }
  });

  function repos() {
    var off = openbutton.offset();
    off.left -= ew - openbutton.width() + 50;
    edit_note.offset(off);
  }
}


function save_test_rc() {
  save_config(function() {
    eeb.callService('test', {t:type, rid:rid}, function(ret) {
      eeb.show_msg_box(null, ret);
      watch_running_change();
    });
  });
}


function save_invoke_rc() {
  save_config(function() {
    eeb.callService('run', {t:type, rid:rid}, function(ret) {
      eeb.show_msg_box(null, ret);
      watch_running_change();
    });
  });
}


function save_config(next) {
  rc.offset_x = jtopo.scene.translateX;
  rc.offset_y = jtopo.scene.translateY;

  eeb.postService('saverc', rc, function(r) {
    if (typeof next == 'function') {
      next();
    } else {
      eeb.show_msg_box(null, r);
    }
    save_msg.save();
  });
}


function initjtopo() {
  jtopo = eeb.createJTopoStage();
  jtopo.scene.mousedown(hide_node_edit);
  jtopo.scene.translateX = rc.offset_x || 0;
  jtopo.scene.translateY = rc.offset_y || 0;
}


function stop_task() {
  eeb.callService('stop', {rid:rid}, function(ret) {
    eeb.show_msg_box(null, ret);
  });
}


//
// 初始化目标配置对话框
//
function init_node_dialog() {
  node_dialog.tabs().dialog({
    modal     : true, 
    show      : true,
    width     : 500, 
    height    : 350, 
    autoOpen  : false,
    title     :'目标配置',
    buttons   : {},
    close : function( event, ui ) {
      var rel = node_dialog.data('releaseAll');
      rel && rel();
    }
  });
}


function hide_node_edit() {
  node_edit.hide();
}


//
// 监视运行中的任务的状态改变, 当任务停止运行
// 监视也会停止, 运行后应该调用该方法
//
function watch_running_change() {

  var chnode   = null;
  var oldpaint = null;
  var revertid = null;

  _loop();

  function _revert_paint() {
    if (chnode) {
      chnode.paint = oldpaint;
    }
  }

  function stop_timeout() {
    clearTimeout(revertid);
  }

  function _loop() {
    eeb.callService('state', {rid:rid}, function(data) {

      // console.log('!!!!', data);

      if (data.isstop || data.state != 2) {
        stop_timeout();
        _revert_paint();
        return;
      }

      if (data.uptime) {
        updateHistoryDialog();
      }

      var _node = nodeOnTarget[ data.tid ].node;
      if (_node !== chnode) {
        _revert_paint();

        // 保存原始绘制器
        chnode = _node;
        oldpaint = chnode.paint;
        chnode.paint = getAnimateNodePainter(oldpaint);
      }

      revertid = setTimeout(_loop, 100);
      
    }, stop_timeout);
  }
}


function updateHistoryDialog(popup) {
  var dom   = $('#__history_list');
  // 要和 core.js 同步
  var STATE = {"4":'错误', '-1':'停止', '1':'初始化', '2':'运行中', '3':'停止中'};
  var title = '';

  eeb.callService('his', {rid:rid}, function(his) {
    setHistoryDialog(his);
  });

  function show() {
    var opt = {
      buttons: {
        "关闭": function() {
          $(this).dialog("close");
        }
      },
      // position : { my: "right top", at: "right bottom"},
      width    : '77%',
      height   : '500',
      title    : title
    };

    dom.dialog(opt);
  }

  function setHistoryDialog(his) {
    if (his) {
      title = STATE[his.state];
      var heads = ['时间', '目标', '消息', '数据'];
      var map   = ['time', 'tname', 'msg', 'data'];
      var html  = eeb.createTableHtml(heads, his.content, function(row, c) {
        switch (c) {
          case 0 : return new Date(row.time);
          default: {
            var txt = String( row[map[c]] || '' );
            if (txt.indexOf('<html>') >= 0) {
              return txt;
            } else {
              return $('<a/>').text(txt).html();
            }
          }
        }
      });
      dom.html(html);
    }
    if (popup) show();
  }
}


//
// 特殊节点绘制器
//
function getAnimateNodePainter(oldpaint) {
  var beginDegree = 2*Math.PI;
  var percent = 0.01;

  return function (g) {
    percent += 0.01;
    if (percent > 1) {
      percent = 0.1;
    }

    g.save();
    g.beginPath();
    g.moveTo(0,0);
    g.fillStyle = 'rgba(22, 22, 255, 0.6)';
    g.arc(0, 0, this.width/1.5, beginDegree, beginDegree + beginDegree * percent);
    g.fill();                
    g.closePath();
    g.restore();  
    
    if (oldpaint) {
      oldpaint.call(this, g);
    } 
  };
}


//
// 读取配置
//
function get_run_config() {
  eeb.callService('getrc', {t:type, rid:rid}, function(_rc) {
    rc = _rc;
    namelable.val(rc.name);
    initjtopo();
    initCanvas();
    render_config();
    init_note_dialog();
    init_over();
  });
}


//
// 从配置中绘制已有元素
//
function render_config() {
  // create node
  for (var tid in rc.targets) {
    createTarget(rc.targets[tid]);
  }

  // create link
  for (var tid in rc.dependent) {
    var from = nodeOnTarget[tid].node;
    var child = rc.dependent[tid].child;

    for (var i = child.length-1; i>=0; --i) {
      var to = nodeOnTarget[child[i]].node;
      create_link(from, to);
    }
  }

  // create group
  for (var tid in rc.targets) {
    var tobj = nodeOnTarget[tid];
    if (tobj.conf.group_tid) {
      create_program_group(tobj.node, tobj.conf);
    }
  }
}


//
// 内核返回的数据格式转换为方便页面使用的数据格式
//
function toPageData(ret) {
  var ndata = [];

  for (var c = 0; c < ret.data.length; ++c) {
    var row = ret.data[c];
    for (var r = 0; r < row.length; ++r) {
      if (!ndata[r]) ndata[r] = [];
      ndata[r][c] = row[r];
    }
  }

  ret.data = ndata;
}


//
// 测试运行一个目标, 并得到结果数据
// 结果数据格式 when_ret_data(Error, { head: [], type: [],  data: [] });
//
// 算法: 每个有父节点的节点都会依赖父节点的运行结果, 依次从根节点运行
//       并传递数据到下一节点, 直到当前节点, 返回
//
function testRunTarget(tid, target_conf, fdata, when_ret_data) {
  // if (!rc.dependent[tid]) return when_ret_data(new);

  //
  // 配置数据首先从参数中取得, 之后才尝试从已经保存的配置中取得
  // 参数 target_conf 可以为空
  //
  var targetConfig = target_conf || rc.targets[tid];
  var parent = rc.dependent[tid].parent;

  //
  // 没有父节点则运行自己
  //
  if (parent.length < 1) {
    _run(null, fdata);

  //
  // 否则遍历父节点
  //
  } else if (parent.length == 1) {
    testRunTarget(parent[0], null, fdata, _run);

  //
  // 有多个父节点则进行选择
  //
  } else { // IF (parent.length > 1) {
    select_road(nodeOnTarget[tid].node, parent, function(_p_tid) {
      if (_p_tid) {
        testRunTarget(_p_tid, null, fdata, _run);
      } else {
        when_ret_data(new Error("必须选择父节点才能继续"));
      }
    })
  }

  function _run(err, _fdata) {
    if (err) return when_ret_data(err);

    var post_data = {
      data : _fdata,
      tc   : targetConfig,
      t    : type
    };

    eeb.postService('testtarget', post_data, function(ret) {
      ret = JSON.parse(ret);
      when_ret_data(null, ret);

    }, function(err) {
      when_ret_data(err);
    });
  }
}


//
// 以 curr_tid 作为当前节点, 寻找父节点并取得数据
// 如果父节点无数据, 则继续上溯, 直到没有更多节点
//
function getDataFromParent(curr_tid, when_get_parent_data) {
  var parent = rc.dependent[curr_tid].parent;

  if (parent.length < 1) {
    retErr('没有可获取数据的前级目标节点');

  } else if (parent.length > 1) {
    select_road(nodeOnTarget[curr_tid].node, parent, function(_p_tid) {
      if (_p_tid) {
        testRunTarget(tid, null, null, pack_err(when_get_parent_data));
      } else {
        retErr('必须选择父节点才能继续');
      }
    });

  } else { /* IF parent.length == 1 */
    testRunTarget(parent[0], null, null, pack_err(when_get_parent_data));
  }

  function pack_err(fn) {
    return function(err, data) {
      if (err) retErr('父节点配置错误, 获取数据失败, ' + JSON.stringify(err));
      else fn(null, data);
    }
  }

  function retErr(msg) {
    // easy_dialog('<div>' + msg + '</div>', node_dialog.find('#program_config'));
    eeb.show_msg_box('错误', msg, null, 0);
    when_get_parent_data(new Error(msg), null);
  }
}


//
// 弹框, 从路径数组中选择一条路径, 由 rcb 返回
// rcb : Function(tid) -- 取消 tid 为 null
//
function select_road(curr_node, road_arr, rcb) {
  var options = {
    title : '选择一条上级任务路径',
    not_close_button: true,
    buttons : {  
      "确定": __ok,
      "取消": __close,
    },
  };

  var html = [ '<form>' ], 
      _ = function(t) { html.push(t); return _; };

  // 检索所有父节点到当前节点的连线
  road_arr.forEach(function(pid) {
    nodeOnTarget[pid].link.forEach(function(lk) {
      if (lk.nodeZ === curr_node) {
        _('<input type="radio" name="sel_r" value="')(lk.nodeA.__tid)('"/>');
        _('<span>&nbsp;')(lk.text)(' - ')(lk.nodeA.text)('</span><br/>');
      }
    });
  });

  _('</form>');
  var _form = eeb.easy_dialog(html.join(''), node_dialog, options);

  function __ok() {
    var selectid = _form.find('[name=sel_r]:checked').val();
    if (selectid) {
      $(this).dialog("close");
      rcb(selectid);
    } else {
      eeb.show_msg_box('警告', '必须' +options.title+ '才能继续', 0, 2);
    }
  }

  function __close() {
    $(this).dialog("close");
    rcb(null);
  }
}


//
//  读取程序列表, 初始化功能菜单
//
function read_program_list() {
  var dom = [];
  var _ = function(s) { dom.push(s); return _; };

  eeb.callService('proglist', {t:type}, function(list) {

    for (var groupname in list) {
      _('<h6>')(groupname)('</h6><ul>');
      var group = list[groupname], pcu = 0;

      for (var i = 0; i<group.length; ++i) {
        var prog = group[i];
        program[prog.programID] = prog;
        if (prog.not_display) continue;

        _('<li class="program_draggable" pid="')(prog.programID)('">');
        _('<img align="middle" src="')(b_icon + prog.icon)('"/>')
        _(prog.name);
        _('</li>');
        ++pcu;
      }

      if (pcu < 1) {
        console.log('is null group', groupname)
        dom.pop(); dom.pop(); dom.pop(); 
      } else {
        _('</ul>');
      }
    }

    $('#__function_list')
      .append(dom.join(''))
      .accordion({
        autoHeight : true,
        heightStyle : "content",
        collapsible : true,
        animate : 200,
        // icons: accordionIcons,
        header : "h6",
      });

    get_run_config();
  });
}


//
// 初始化画板, 和拖拽动作, 拖拽时会修改配置
//
function initCanvas() {

  $('.program_draggable').draggable({
    helper: function() {
      var _new = $(this).clone(true);
      $(document.body).append(_new);
      return _new;
    }
  });

  $('.canvas_content').droppable({
    accept: ".program_draggable",

    drop: function( event, ui ) {
      var item = $(this);
      var pos = item.position();
      var half = parseInt(icon_size / 2);
      var x = event.pageX - pos.left - half - jtopo.scene.translateX;
      var y = event.pageY - pos.top  - half - jtopo.scene.translateY;
      var pid = ui.draggable[0].getAttribute('pid');
      create_target_conf_node(x, y, pid);
      save_msg.change();
    }
  });
}


//
// 读取配置创建目标, 创建节点
// rcb -- Function(obj), 数据结构由 fun721 绝对
//
function create_target_conf_node(x, y, pid, rcb) {
  var prog = program[ pid ];

  eeb.callService('uuid', {}, function(tid) {
    //
    // 这里创建了 rc 的 targets 部分
    //
    var config = {
      tid             : tid,
      tname           : prog.name,
      programID       : pid,
      run_config      : {/* 从接口取得 */},
      group_program   : prog.group_program,

      disp_config : {
        x             : x, 
        y             : y,
        w             : icon_size,
        h             : icon_size,
        icon          : prog.icon,
        strokeColor   : null,
        dashedPattern : 'nan',
        lineWidth     : 2
      }
    }

    eeb.callService('inittarget', {pid:pid}, function(tconf) {
      // console.log(config)
      config.run_config = tconf;
      rc.targets[tid] = config;
      rc.dependent[tid] = {
        child: [], parent: []
      }
      createTarget(config, rcb);
    });
  });
}


//
// 检查循环引用, 失败返回 true
//
function check_loop_link() {
  var dep = rc.dependent;

  for (var tid in dep) {
    var road = {};
    road[tid] = 1;

    if (loop(road, tid)) {
      return true;
    }
  }
  return false;

  function loop(tid, nid) {
    var dc = dep[nid].child;
    for (var i = dc.length-1; i>=0; --i) {

      if (road[ dc[i] ]) {
        return true;
      }
      road[ dc[i] ] = 1;
      if ( loop(road, dc[i]) ) {
        return true;
      }
      delete road[ dc[i] ];
    }
    return false;
  }
}

//
// 检查有效性并创建连线, 修改配置
// 失败返回 true, 检查后会改变 rc.dependent 的结构
//
function check_create_link(from, to) {
  var fdep = getDep(from.__tid);
  var tdep = getDep(to.__tid);

  for (var i = fdep.child.length-1; i>=0; --i) {
    if (fdep.child[i] == to.__tid) {
      log("不能重复连接");
      return true;
    }
  }

  fdep.child.push(to.__tid);
  tdep.parent.push(from.__tid);

  if (check_loop_link()) {
    log("不能循环连接");
    fdep.child.pop();
    tdep.parent.pop();
    return true;
  }

  create_link(from, to);
  return false;

  function getDep(_tid) {
    //
    // 这里创建/修改了 rc 的 dependent 部分
    //
    var ret = rc.dependent[_tid];
    if (!ret) {
      ret = rc.dependent[_tid] = {
        child: [], parent: []
      }
    }
    return ret;
  }
}

//
// 创建一个连线, 但不修改配置
// 从 thisConfig 保存/读取 link 的样式
//
function create_link(from, to) {
  var thisConfig = nodeOnTarget[from.__tid];
  var disp = thisConfig.conf.disp_config;
  var linkid = ++__linkid;

  // FlexionalLink CurveLink FoldLink Link
  var link = new JTopo.Link(from, to, '路径' + linkid);
  link.direction     = 'vertical'; // horizontal vertical
  link.arrowsRadius  = 10;
  link.bundleOffset  = 60;
  link.bundleGap     = 20;
  link.textOffsetY   = 3;
  link.lineWidth     = disp.lineWidth || 2;
  link.strokeColor   = disp.strokeColor || JTopo.util.randomColor();
  link.dashedPattern = isNaN(disp.dashedPattern) ? null : disp.dashedPattern
  jtopo.scene.add(link);

  disp.strokeColor = link.strokeColor;

  thisConfig.link.push(link);
}


//
// 取得节点的子节点路径列表
// ret = { '路径 tid': '路径名称', ... }
//
function get_child_path(tid) {
  var ret = {};
  nodeOnTarget[tid].link.forEach(function(lk, i) {
    ret[lk.nodeZ.__tid] = lk.text + ' - ' + lk.nodeZ.text;
  });
  return ret;
}


//
// 创建程序组容器
//
function create_group_container(name) {
  var container = new JTopo.Container(name);
  container.textPosition  = 'Middle_Center';
  container.fontColor     = '100,255,0';
  container.font          = '18pt 微软雅黑';
  container.borderRadius  = 10; // 圆角
  container.borderWidth   = 10;
  // container.borderColor = '255,0,0';
  jtopo.scene.add(container);
  return container;
}


//
// 创建程序组
//
function create_program_group(node, config, cnext) {
  var disp      = config.disp_config;
  var container = create_group_container();
  var i         = -1;
  var y_space   = icon_size * GROUP_ITEM_SPACE;
  var y         = disp.y + y_space;
  
  container.add(node);
  nodeOnTarget[config.tid].onRemove(remove_all);

  if (config.group_program) {
    config.group_tid = [];
    _next();
  } else if (config.group_tid) {
    config.group_tid.forEach(do_pair_tid);
  } else {
    throw new Error('cannot call create_program_group');
  }

  function do_pair_tid(_tid) {
    var tobj = nodeOnTarget[_tid];
    container.add(tobj.node);
    tobj.onRemove(remove_all);
  }

  function _next() {
    if (++i >= config.group_program.length) {
      // 修正不绘制 container 的问题
      jtopo.stage.paint();
      delete config.group_program;
      return cnext && cnext();
    }
    
    create_target_conf_node(disp.x, y + i*y_space, 
        config.group_program[i], when_create_over);
  }

  function when_create_over(pair_node, pair_config) {
    config.group_tid.push(pair_config.tid);
    container.add(pair_node);
    nodeOnTarget[ pair_config.tid ].onRemove(remove_all);
    _next();
  }

  //
  // 删除所有元素, 节点, 连线, 程序组
  //
  function remove_all(event_tid) {
    var del = function(_tid) { 
      var tobj = nodeOnTarget[_tid];
      if (tobj && (_tid != event_tid)) {
        tobj.removeAll(); 
      }
    };

    del(config.tid);
    config.group_tid.forEach(del);
    jtopo.scene.remove(container);
  }
}


//
// 创建一个目标, 包含节点和连线
//
function createTarget(config, rcb_when_node) {
  var disp        = config.disp_config;
  var del_event   = $.Callbacks();
  var node        = new JTopo.Node(); 
  node.text       = config.run_config.name || config.tname;
  node.fontColor  = '#333';
  node.__tid      = config.tid;

  node.setImage(b_icon + disp.icon);
  node.setBound(disp.x, disp.y, disp.w || icon_size, disp.h || icon_size);
  jtopo.scene.add(node);

  //
  // nodeOnTarget 的数据结构
  //
  nodeOnTarget[config.tid] = {
    node      : node,
    conf      : config,
    link      : [],
    // 删除这个节点和连线
    removeAll : _del_node,
    // 注册删除事件监听器, 在完全删除之后调用
    onRemove  : function(fn) { del_event.add(fn); }
  }

  //
  // 创建程序关联组
  //
  if (config.group_program && config.group_program.length > 0) {
    create_program_group(node, config, call_rcb_when_node);
  } else {
    call_rcb_when_node();
  }

  //
  // 回调返回对象的数据结构
  // :fun721
  function call_rcb_when_node() {
    if (rcb_when_node) {
      rcb_when_node(node, config);
    }
  }

  //
  // 位置改变也要提示保存
  //
  node.mousedrag(save_msg.change);


  node.mouseup(function(e) {
    var bond = node.getBound();
    disp.x = bond.left;
    disp.y = bond.top;
    disp.w = bond.width;
    disp.h = bond.height;

    var off = canvas.offset();
    if (jtopo.scene.scaleX == 1 && jtopo.scene.scaleY == 1) {
      off.left += jtopo.scene.translateX + disp.x  + disp.w + 8;
      off.top  += jtopo.scene.translateY + disp.y;   
    } else {
      off.left += e.offsetX + 20;
      off.top  += e.offsetY - 15;
    }

    node_edit.show().offset(off).find('button').off();
    node_edit.find('.add_link_div').html('');

    node_edit.find('.conf').click(hide_node_edit).click(_conf_node);
    node_edit.find('.link').click(hide_node_edit).click(_draw_link);
    node_edit.find('.del' ).click(hide_node_edit).click(_del_node);

    // 生成 `删除连接` 的按钮
    nodeOnTarget[config.tid].link.forEach(function(lk, i) {
      var thisid = config.tid, 
          otheid = lk.nodeZ.__tid;

      // 当下一个节点已经被删除的时候, 这条连线已经失效了
      if (!rc.dependent[otheid]) {
        _remove_link();
        return;
      }

      $('<button class="btn btn-warning btn-sm" style="display:block">删:' + lk.text + '</button>')
        .appendTo(node_edit.find('.add_link_div'))
        .click(function() {
          array_del_val(rc.dependent[thisid].child,  otheid);
          array_del_val(rc.dependent[otheid].parent, thisid);
          $(this).remove();
          _remove_link();
        });

      function _remove_link() {
        jtopo.scene.remove(lk);
        nodeOnTarget[config.tid].link.splice(i, 1);
        save_msg.change();
      }
    });

    ext_event.trigger('edit-node-menu-created', [node_edit]);
  });


  //
  // 节点配置对话框的初始化
  //
  function _conf_node() {
    // 复制出一份, 在关闭后做一个空函数
    var _node_dialog = node_dialog;
    var win          = $(window);
    var w            = win.width()  * 0.9;
    var h            = win.height() * 0.95;
    var prog         = program[ config.programID ];
    var adv          = _node_dialog.find('#program_config');
    var releaseFn    = [];
    // 配置时从这个变量中取临时数据, 而不要从 config 中
    var copy_rc      = $.extend(true, {}, config.run_config);

    //
    // 当确认按钮被按下, 开始检查配置有效性, 之后调用该方法
    // Function(err, succ)
    //
    var when_check_success_fn = null;

    //
    // 按钮顺序与设置顺序有关
    //
    var buttons = _node_dialog.dialog("option", "buttons");
    buttons['确定']       = buttonOk;
    buttons['取消']       = buttonCancel;
    buttons['初始化']     = buttonInit;
    buttons['测试运行']   = buttonTest;
    

    _node_dialog.dialog({width: w, height: h, buttons: buttons})
                .tabs("disable", '#target_run_result') 
                .tabs('disable', '#bizlog_config')
                .tabs("option", "active", 0)
                .dialog('open');
    
    eeb.auto_form_ui(_node_dialog);
    eeb.fix_dialog_ui(_node_dialog);
    initBasicVal();
    initTargetPage();
    initBizlog();
    init_help();


    // 绑定释放数据的函数
    _node_dialog.data('releaseAll', function() {
      releaseFn.forEach(function(fn) { fn(); });
      _node_dialog.removeData('releaseAll');
    });

    // 基本配置页面数据绑定
    function initBasicVal() {
      var release = eeb.create_bind(config, '#basic_config form', function() {
        // node.text = config.tname;

        nodeOnTarget[config.tid].link.forEach(function(lk) {
          lk.dashedPattern = isNaN(disp.dashedPattern) ? null : disp.dashedPattern;
          lk.strokeColor   = disp.strokeColor;
          lk.lineWidth     = disp.lineWidth;
        });

        // 原先弹出对话框
        // easy_dialog('成功', node_dialog);
        // eeb.show_msg_box(null, '成功');
        return true;
      });
      releaseFn.push(release);
    }

    function init_help() {
      var hbutton = _node_dialog.find('a[href="#target_help"]');
      hbutton.hide();
      if (prog._no_help) return;

      //
      // 帮助页面与配置页面同名不同目录
      //
      var help_page = HELP_DIR + prog.configPage;
      var jhelp = $('#target_help');

      eeb.load_file(help_page, function(jdom) {
        jdom.hide();
        jhelp.find('*').remove('*');
        jhelp.html(jdom.html());
        hbutton.show();
      }, function() {
        // 这个属性在刷新页面后会丢失
        prog._no_help = true;
        console.log('没有帮助页面:', help_page);
      });
    }

    function initBizlog() {
      var bizconf = copy_rc.bizlog;
      var blbutton = _node_dialog.find('a[href="#bizlog_config"]');
      if (!bizconf) {
        blbutton.hide();
        return;
      }

      blbutton.show();
      var html = [], p = function(t) { html.push(t); return p; };
      var bizpage = _node_dialog.tabs("enable", '#bizlog_config')
                                .find('#bizlog_config');

      p("<form class='smart-form' onsubmit='return false'>");

      for (var n in bizconf) {
        var item = bizconf[n];
         p('<section class="col col-md-12">')
          ('<label class="label">')
          ("  <input name='")(n)(".enable' col='1' type='checkbox'/>")
          (' 启用: &nbsp;&nbsp;')(item.desc)
          ('</label>')
          ('<label class="input">')
          ("  <input name='")(n)(".msg' col='12' placeholder='自定义消息'/>")
          ('</label>')
          ('</section>')
          ('<hr class="simple" style="width:100%; clear:both;"/>');
      }

      p('</form>');

      bizpage.find('*').remove('*');
      bizpage.html(html.join(''));
      eeb.auto_form_ui(bizpage);

      var release = eeb.create_bind(bizconf, bizpage, function() {
        // console.debug('!!!!', html.join(''), JSON.stringify(bizconf))
        return true;
      });
      releaseFn.push(release);
    }

    // 确定按钮被按下, 才应用修改后的配置
    function buttonOk() {
      when_check_success_fn = function(err, succ) {
        if (!err) {
          ext_event.trigger('config-change', [config, copy_rc]);
          config.run_config = copy_rc;
          node.text = config.tname = copy_rc.name;
          buttonCancel();
        }
        when_check_success_fn = null;
      };

      _node_dialog.find('#basic_config form').trigger('submit');
      _node_dialog.find('#bizlog_config form').trigger('submit');
      // 修改表单中的 _type 使之不会执行其他的操作
      adv.find('*[name=_type]').val('').trigger('change');
      adv.find('form').trigger('submit');
      save_msg.change();
    }

    // 只是关闭, 不做其他操作
    function buttonCancel() {
      _node_dialog.dialog("close");
      _node_dialog = _node_dialog.slice(0,0);
    }

    // 测试按钮页面初始化
    function buttonTest() {
      var activeTab = 3;

      _node_dialog.tabs("enable", '#target_run_result')
                  .tabs("option", "active", activeTab)
                  .find('#target_run_result')
                  .html("正在读取...");

      // 保证画面的配置数据保存到临时配置中
      adv.find('form').trigger('submit');
      var copy_config = copy_cnf(copy_rc);
      // 自动清除这个属性, 防止在运行时执行其他方法
      copy_config.run_config._type = null;

      testRunTarget(config.tid, copy_config, null, function(err, ret) {
        var html = [];

        if (err) {
          html.push('错误, ');
          html.push(JSON.stringify(err.msg));

        } else if (ret.className == 'esb_data') {
          eeb.json2treeui(html, ret.data, null, true);

        } else if (ret.className == 'etl_data') {
          
          toPageData(ret);
          var _temp = eeb.createTableHtml(ret.head, ret.data, 'isArray', ret.type);
          html.push('<h6>数据</h6>');
          html.push(_temp);

          var head  = ['时间', '事件'];
          var his = eeb.createTableHtml(head, ret.ext, function(row, c) {
            switch(c) {
              case 0: return new Date(row.time);
              case 1: return row.msg;
            }
          });
          html.push('<h6>日志</h6>');
          html.push(his);

        } else {
          html.push("<div>未知的数据类型, " + JSON.stringify(ret) + "</div>");
        }

        var jdom = 
            _node_dialog.tabs("enable", '#target_run_result')
                        .tabs("option", "active", activeTab)
                        .find('#target_run_result')
                        .html(html.join(''));

        eeb.bind_tree_event(jdom);
      });
    }

    function buttonInit() {
      eeb.callService('inittarget', {pid: config.programID}, function(tconf) {
        // config.run_config = tconf;
        copy_rc = tconf;
        initTargetPage();
        initBizlog();
      });
    }

    function _getDataFromParent(rcb) {
      var progress = eeb.easy_progress();
      getDataFromParent(config.tid, function(err, data) {
        progress.end();
        rcb(err, data);
      });
    }

    function initTargetPage() {
      var rdata = { t: Date.now() };
      $.get(b_config + prog.configPage, rdata, function(dom) {
        //
        // 传给配置页面的对象
        //
        var to_config_page = {
          // JSON
          run_config    : copy_rc,

          // Function(Function(err, succdata))
          check_config  : check_target_config,

          // Function(), 使用配置测试运行
          test          : buttonTest,

          // Function(rcb), 返回父节点运行后的测试数据
          // 如果有多个父节点, 会弹框, 出错会自动弹出消息, 
          // 回调可以忽略错误立即返回
          // rcb: Function(err, data)
          parent_data   : _getDataFromParent,

          // Function(rcb), 对话框被关闭时回调 
          // rcb: Function()
          when_close    : _when_close,

          // Function(rcb), 对程序话框被打开时回调 
          // rcb: Function()
          when_open     : _when_open,

          // Function(), 返回子节点列表
          child_path    : _child_path,

          // Function(), 重新构造业务日志页面
          reload_bizlog : initBizlog,
        };

        // 通过这个 dom 传递数据, 和方法
        adv.data('run_config', copy_rc);
        adv.data('eeb_work', to_config_page);

        try {
          adv.html(dom);
          _fixui();
        } catch(err) {
          var msg = '加载目标页面 ' + b_config + prog.configPage 
                  + ' 时错误: <pre>' + err.stack + "</pre>";
          adv.html(msg);
          console.log(msg);
        }
      }, 'html');

      function _fixui() {
        adv.find(':input')
           .filter('.ok[value=应用]')
           .parent('label').parent('section')
           .remove();
      }

      function _when_close(rcb) {
        releaseFn.push(rcb);
      }

      function _when_open(rcb) {
        var timeid = 0;

        if (rcb) {
          timeid = setInterval(__wait, 300);
          releaseFn.push(__stop);
        }

        function __wait() {
          // console.log('wait', adv.children().width())
          if (adv.children().width() > 0) {
            __stop();
            rcb();
          }
        }

        function __stop() {
          clearInterval(timeid);
        }
      }

      function _child_path() {
        return get_child_path(config.tid);
      }

      releaseFn.push(function() {
        adv.removeData('run_config');
        adv.removeData('eeb_work');
      });
    }


    //
    // 复制一份配置用于进行测试, 之后丢弃
    //
    function copy_cnf(_copy_rc) {
      var _run_config = $.extend(true, {}, config);
      if (_copy_rc) _run_config.run_config = _copy_rc;
      return _run_config
    }


    //
    // 这个方法被导出给配置页面, 调用后会检查配置有效性
    // 并把错误消息发送到页面
    //
    // _handle 返回: 
    //       'no_msg' 不弹出任何消息, 
    //       'no_err_msg' 不弹出失败消息, 
    //       'no_succ_msg' 不弹出成功消息
    //       什么都不返回则弹出所有消息
    // _handle -- Function(err, retmsg) 
    //
    function check_target_config(_handle) {
      var adv = _node_dialog.find('#program_config');
      var cls = '__ipt_field_err__';
      adv.find('.' + cls).remove();


      eeb.postService('checktarget', copy_cnf(copy_rc), function(ret) {
        adv.find('.' + cls).remove();

        var ret_type = null;
        var is_err   = (ret['noerror'] != true);

        var p_handle = function(err, data) {
          ret_type = _handle && _handle(err, data);
          when_check_success_fn && when_check_success_fn(err, data);
        }

        if (is_err) {
          p_handle(ret, null);
        } else {
          p_handle(null, ret);
        }

        if (ret_type == 'no_msg') 
          return;
        if (is_err && ret_type == 'no_err_msg') 
          return;
        if (is_err == false && ret_type == 'no_succ_msg') 
          return;

        if (typeof ret == 'string') {
          // easy_dialog(ret, node_dialog);
          eeb.show_msg_box(null, ret, null, null);
        } else {
          if (ret.retmessage) {
            eeb.show_msg_box(null, ret.retmessage, null, null);
            // 此时删除 不会影响 _handle
            delete ret.retmessage;
          }
          eeb.ret_message_to_form(adv, ret, cls);
        }
      });
    }
  } // End _conf_node


  //
  // 点击连接的时候, 绘制一个临时线段, 指示要连接的节点
  //
  function _draw_link() {
    var tempNodeZ = new JTopo.Node('点击一个节点.................');;
    tempNodeZ.setSize(1, 1);
    jtopo.scene.add(tempNodeZ);

    var link = new JTopo.Link(node, tempNodeZ);
    link.arrowsRadius = 10; 
    link.dashedPattern = 5;
    jtopo.scene.add(link);

    jtopo.scene.mousemove(function(e){
      tempNodeZ.setLocation(e.x, e.y);
    });

    jtopo.scene.mouseup(function(e) {
      if (e.button == 2 /*右键 2, 左键 0*/ ) {
        return removeAll();
      }
      var tn = e.target;
      if (tn instanceof JTopo.Node && tn != node) {
        check_create_link(node, tn);
        removeAll();
      }
      save_msg.change();
    });

    // 删除临时元素
    function removeAll() {
      jtopo.scene.remove(link);
      jtopo.scene.remove(tempNodeZ);
      jtopo.scene.removeEventListener('mousemove');
      jtopo.scene.removeEventListener('mouseup');
    }
  } // End _draw_link


  //
  // 删除节点, 删除与之有关的连线, 删除配置
  //
  function _del_node() {
    var tobj = nodeOnTarget[config.tid];
    tobj.link.forEach(function(lk) {
      jtopo.scene.remove(lk);
    });
    jtopo.scene.remove(tobj.node);

    delete nodeOnTarget[config.tid];

    _del_dependent(config.tid, 'child', 'parent');
    _del_dependent(config.tid, 'parent', 'child');

    delete rc.dependent[config.tid];
    delete rc.targets[config.tid];
    
    del_event.fire(config.tid);
    log('删除目标:', config.tname, '[', config.tid, ']');
  }

  //
  // t == child, c == parent
  //  删除 del_id 节点的 [子] 依赖项的 [父] 项
  //  并删除 child 中的项
  //
  function _del_dependent(del_id, t, c) {
    rc.dependent[del_id][t].forEach(function(ch_id) {
      array_del_val(rc.dependent[ch_id][c], del_id);
    });
  }

  //
  // 删除数组中与 v 相等的元素
  //
  function array_del_val(arr, v) {
    for (var i=0; i< arr.length; ++i) {
      if (v == arr[i]) {
        arr.splice(i,1);
        --i;
      }
    }
  }

} // End createTarget


});