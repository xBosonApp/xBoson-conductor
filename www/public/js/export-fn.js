$(document).ready(function() {

relayout(create_canvas);

//----------------------------------------------------------------
//
// 导出全局函数
// `eeb` 名字空间
//
//----------------------------------------------------------------

var eeb = window.eeb = {
  log                       : log,
  createJTopoStage          : createJTopoStage,
  callService               : callService,
  postService               : postService,
  create_bind               : create_bind,
  show_msg                  : show_msg,
  fix_dialog_ui             : fix_dialog_ui,
  auto_form_ui              : auto_form_ui,
  ret_message_to_form       : ret_message_to_form,
  callZyapi                 : callZyapi,
  easy_dialog               : easy_dialog,
  getOrg                    : getOrg,
  getOpenID                 : getOpenID,
  show_msg_box              : showBox,
  get_zy_dict               : get_zy_dict,
  createTableHtml           : createTableHtml,
  button_group              : button_group,
  load_file                 : load_file,
  pagination                : pagination,
  create_ace_editor         : create_ace_editor,
  json2treeui               : json2treeui,
  bind_tree_event           : bind_tree_event,
  out_val_flow_in           : out_val_flow_in,
  select_file_from_pool     : select_file_from_pool,
  change_type_button        : change_type_button,
  easy_progress             : easy_progress,
  getParentFormParm         : getParentFormParm,
  create_rotate             : create_rotate,
  get_wnid                  : get_wnid,
  parse_url_parm            : parse_url_parm,
  createOptions             : createOptions,
  extends                   : _extends,
  not_back_event            : not_back_event,
};


//
// 用来弹出信息对话框的函数
// 首先会隐藏 _parent 的窗口
//
function easy_dialog(msg, _parent, _options) {
  var pd = _parent && _parent.parents('.ui-dialog');
  var z = pd && pd.css("z-index");

  //
  // 不可以有默认 width, height, 因部分页面需要最小化显示
  //
  var defopt = {
    modal   : true,
    show    : true,
    hide    : false,
    title   : '信息',
    // width   : '80%',
    close_not_remove : false, // true 则关闭后不释放资源, 下次可以打开
    not_close_button : false, // true 则不需要自动创建 '关闭' 按钮

    buttons : {},
    close   : function( event, ui ) {
      pd && pd.css("z-index", z);
      if (_options.close_not_remove !== true) {
        msg.remove('*');
      }
    },
    open    : function( event, ui ) {
      pd && pd.css("z-index", 1);
    },
  };

  if (_options) {
    jQuery.extend(true, defopt, _options);
    if (defopt.not_close_button !== true) {
      defopt.buttons["关闭"] = function() {
        $(this).dialog("close");
      }
    }
  }

  if (msg.ret) {
    console.log("auto msg attr !");
    msg = msg.msg[0];
  }

  if (typeof msg == 'string') {
    msg = $('<div>' + msg + '</div>');
  }

  var di = msg.dialog(defopt);
  fix_dialog_ui(di);
  return di;
}


//
// 打开一个进度条
// opt :
//    autoBegin : bool 自动启动进度条
//    title : 标题
//    label : 内容标签
//
// return :
//    begin : 启动进度条
//    end   : 结束进度条
//
function easy_progress(opt) {
  opt = $.extend({
    autoBegin : true,
    title     : '读取中...',
    label     : '正在努力加载: '
  }, opt);

  var html =
    "<div title='" + opt.title + "' class='border: 0'> \
      <div class='progress-label'>正在初始化...</div> \
      <div class='progress'> \
        <div class='progress-bar bg-color-blueLight' \
             style='width: 0.1%;'></div> \
      </div> \
    </div>";

  var progressbar = $(html);
  var progressLabel = progressbar.find('.progress-label');
  var bar = progressbar.find('.progress-bar');
  var timeid = null;
  var tcount = 0;
  var add = 0.3;

  progressbar.progressbar({
    value: false,
    change: function() {
      var v = progressbar.progressbar( "value" );
      progressLabel.text( opt.label + v + "%" );
      bar.css({ width : v + '%' });
    },
    complete: function() {
      clearInterval(timeid);
      progressLabel.text( "完成!" );
      progressbar.dialog('close');
    }
  }).dialog({ modal:true });

  if (opt.autoBegin) {
    begin();
  }

  function begin() {
    if (timeid !== null) return;
    timeid = setInterval(function() {
      var ps = Number((tcount+=add).toFixed(2));
      if      (ps >= 80) add = 0.1;
      else if (ps >= 90) add = 0.001;
      else if (ps >= 99) clearInterval(timeid);
      progressbar.progressbar("value", ps);
    }, 100);
  }

  function end() {
    progressbar.progressbar("value", 100);
  }

  return {
    begin : begin,
    end   : end,
  }
}


//
// 创建表格的 html
// heads -- Array 表格头数组, 元素是 String
// datas -- Array 表格数据数组, 元素是对象
// column_getter -- Function(obj, c, r, column_name) || Array
//      如果是函数, 迭代每一个 datas 放入这个函数, 返回正确的列, c 列数, r 行数
//      如果是数组, 则每个元素是 obj 的属性名, 索引是对应的列
//      如果是 'isArray' 则任务 datas 中的元素还是数组, 直接从索引映射
// heads2 -- 可选的, 表格头2
//
function createTableHtml(heads, datas, column_getter, heads2) {
  var html = [];
  var _  = function(t) { html.push(t); return _; };

  var _h = function(t) { _('<th>')(t)('</th>'); return _h; };
  var _b = function(t) { _('<td>')(t)('</td>'); return _b; };

  var column_map = null;

  if (column_getter == 'isArray') {
    column_getter = function(obj, c) {
      return obj[ c ];
    };
  }
  else if (column_getter.constructor === Array) {
    column_map = column_getter;

    if (column_map.length != heads.length) {
      throw new Error('column_map and heads length must eq.');
    }

    column_getter = function(obj, c) {
      return obj[ column_map[c] ];
    };
  }

  _('<table class="table table-bordered table-striped no-footer dataTable">')
    _('<thead> <tr>')
    heads.forEach(_h);
    _('</tr> <tr>')
    heads2 && heads2.forEach(_h);
    _('</tr> </thead>')
    _('<tbody>')
    datas.forEach(function(obj, r) {
      _('<tr>')
      heads.forEach(function(name, c) {
        _b( column_getter(obj, c, r, name) );
      });
      _('</tr>')
    });
    _('</tbody>')
  _('</table>')

  return html.join('');
}


//
// 调用平台 api, option 必须有参数: api, mod, app
// rcb: Function(jsondata)
//
function callZyapi(option, rcb, err_cb) {
  console.log('!!', new Error().stack)
  option.org = getOrg();
  option.openid = getOpenID();
  // 提供一个已经注册过的 sys, 如果当前 sys 尚未注册不能调用平台接口
  // option.sys = 'da4a81635b4c453aaea3598e81e6e3dc';

  if (!option.className) {
    option.className = $('#__page_class_name_type').html();
  }

  eeb.callService('zy', option, function(data) {
    try {
      var d = JSON.parse(data);

      if (d.ret != 0) {
        if (err_cb) {
          err_cb(d);
        } else {
          eeb.log(d.msg, option);
          eeb.show_msg_box(null, d.msg);
        }
        return;
      }

      rcb(d);
    } catch(e) {
      err_cb(e);
    }
  }, err_cb);
}


function getOrg() {
  var org = null;
  try {
    org = zy.g.comm.org;
  } catch(err) { }
  return org || 'a297dfacd7a84eab9656675f61750078';
}


function getOpenID() {
  var id = null;
  try {
    id = zy.g.comm.openid;
  } catch(err) { }
  return id;
}


//
// 生成下拉列表 select 的 html 代码
// html_getter -- Function(select-html)
// only_options -- 不许要生成 select 标签
//
function get_zy_dict(dictid, html_getter, only_options) {
  eeb.callZyapi({
    api     : 'getdict',
    mod     : 'ZYMODULE_LOGIN',
    app     : 'ZYAPP_LOGIN',
    typecd  : dictid,
    orgid   : getOrg()
  }, _init_data, _from_cache);

  function _from_cache() {
    var cc = eeb.dict[dictid];
    if (cc) {
      _init_data(cc);
      return true;
    }
  }

  function _init_data(d) {
    var dictarr = d.result[0][dictid];
    var html = [], _ = function(s) { html.push(s); return _; };

    if (!only_options) {
      _('<select>');
    }

    dictarr.forEach(function(item) {
      _('<option value="')(item.id)('">');
      _(item.text);
      _('</option>');
    });

    if (!only_options) {
      _('</select>');
    }

    html_getter(html.join(''));
  }
}


//
// message_obj 的属性与 jform 中表单的 name 属性相同时
// 就把这个属性的值作为消息, 显示在表单上
// 显示消息的 dom.class = cls
//
// 如果表单使用了 popmsg 属性则会弹出消息框
// popmsg ==  0:错误 1:铃铛 2:消息 3:完成
//
function ret_message_to_form(jform, message_obj, cls) {
  var errcount = 0;

  for (var field in message_obj) {

    // console.log(field, message_obj[field])
    //
    // 直接把返回的 key 映射到 input.name 上
    //
    var fi = jform.find(':input[name="' + field + '"]');

    if (fi.size() < 1) {
      //
      // 在画面上找不带对应的 UI 元素 ?
      //
      console.log(null, '返回字段无映射 ' + field + ',' + message_obj[field]);
      continue;
    }

    fi.each(function() {
      var thiz = $(this);
      var popmsg = thiz.attr('popmsg');
      var msg = message_obj[field];


      if (popmsg >= 0) {
        var lb = thiz.attr('label');
        if (lb) {
          msg = lb + msg;
        }
        showBox(null, msg, null, popmsg);

      } else {
        var left_margin = 15;
        var jinput = thiz;
        //
        // select2 会把控件变成 1 像素
        //
        if (thiz.width() < 2 && thiz.height() < 2) {
          thiz = thiz.parent();
          left_margin = 40;
        }

        var pos = thiz.offset();

        var m = '<p class="has-error" style="position:absolute">'
              + '<span class="help-block ' + cls
              + '"><i class="fa fa-warning"></i> '
              + msg + '</span></p>';

        var mm = $(m).insertAfter(thiz);
        var _rm = function() { mm.remove(); };
        pos.left += thiz.outerWidth() - mm.outerWidth() - left_margin;
        pos.top  += thiz.outerHeight()/2 - mm.outerHeight()/2;
        mm.offset(pos);
        ++errcount;

        setTimeout(_rm, 20*1000);
        jinput.one('keyup', _rm);
        jinput.one('change', _rm);
      }
    });
  }

  if (errcount && message_obj.noerror != true) {
    showBox(null, '参数有错误');
  }
}


//
// 弹出一个消息框
// _title     -- 标题, 可以为空
// _txt       -- 内容
// _time      -- 停留时间 ms, 可以为空
// _type_idx  -- 类型, 0:错误 1:铃铛 2:消息 3:完成, 可以为空
// _when_hide -- 对话框关闭时的回调, 可以空
//
function showBox(_title, _txt, _time, _type_idx, _when_hide) {

  var types = [
    ['fa fa-warning shake animated', '#C46A69'],
    ['fa fa-bell swing animated', '#3276B1'],
    ['fa fa-shield fadeInLeft animated', '#C79121'],
    ['fa fa-check', '#739E73']
  ];

  if (!_txt) return;
  if (typeof _txt != 'string') _txt = JSON.stringify(_txt);

  var iserr = _txt.indexOf('错误')>=0 || _txt.indexOf('失败') >= 0;

  if (!_title) {
    _title = iserr ? '错误' : '消息';
  }

  if (_type_idx == null) {
    _type_idx = iserr ? 0 : 1;
  } else {
    _type_idx = iserr ? 0 : _type_idx;
  }

  var t = types[_type_idx];

  $.smallBox({ // smallBox bigBox
    title   : _title,
    content : _txt,
    color   : t[1],
    icon    : t[0],
    timeout : _time || (_type_idx === 0 ? 9000 : 2000),
    sound   : '',
    // number : "2",
  }, _when_hide);
}


//
// 相同的对话框不会重复叠加的显示
//
function showBoxOnly(_title, _txt, _time, _type_idx) {
  var c = showBoxOnly.caller;
  if (!c.__show_boox__) {
    c.__show_boox__ = true;
    showBox(_title, _txt, _time, _type_idx, function () {
      c.__show_boox__ = null;
    });
  }
}


//
// 使选择器下的具有 label 属性的标签自动布局, 和生成 label
// 重复调用不会重复生成, label 可以有 col 属性指定宽度 (优先于 column_count)
// el 选择的对象必须包含 .smart-form, 或本身级就是 .smart-form
// column_count 默认 = 2
// 如果 column_count 是数组, 则数组的元素指定每一行元素的数量
// 例: [2,3] 第一行有2个, 第二行有 3个
//
function auto_form_ui(el, column_count) {
  var col = [];
  var default_col = 6;

  if (column_count && column_count.constructor == Array) {
    column_count.forEach(function(count, row) {
      for(var i=0; i<count; ++i) {
        col.push(12 / count);
      }
    });
  } else if (typeof column_count == 'number') {
    default_col = 12 / column_count;
  }

  var sel = $(el);
  var selinput = sel.find("*[label]:not([auto_form_ui=true])");
  var thegroup = {};

  selinput.each(function(i) {
    var ts   = $(this);
    var txt  = ts.attr('label');
    var _cc  = ts.attr('col') || col[i] || default_col;
    var type = this.tagName.toLocaleLowerCase();
    var grp  = ts.attr('group');

    if (type == 'button') {
      ts.css({ 'float': 'right', 'padding': '2px 5px' });
      type = 'input';
    }

    if (grp && thegroup[grp]) {
      thegroup[grp].append(ts);
    } else {
      ts.wrap("<section class='col col-md-" + _cc + "'></section>");
      ts.wrap("<label class='" + type + "'></label>");
      if (grp) {
        ts.wrap("<div class='btn-group' style='width: 100%;'></div>");
        thegroup[grp] = ts.parents('.btn-group');
      }
      ts.parents('.col').prepend("<label class='label'>" + txt + "</label>");
    }

    // if (type == 'select') {
    //   ts.select2({ width: '100%', allowClear: false });
    // }

    ts.attr('placeholder') || ts.attr('placeholder', txt);
    ts.attr('auto_form_ui', true);
  });

  // This is Hack!
  var smartf = null;
  if (sel.hasClass('smart-form')) {
    smartf = sel;
  } else {
    smartf = sel.find('.smart-form');
  }
  if (smartf.size() < 1) {
    //...
  }
  smartf.append("<div style='width:100%; clear:both'></div>");
}


//
// 修正 jquery 弹出窗口按钮样式
// 修正鼠标按下后滚动条归位的问题
//
function fix_dialog_ui(el) {
  $(el).parents('.ui-dialog')
       .find('.ui-dialog-buttonset')
       .find('button')
       .addClass('btn btn-default btn-primary');

  var prev = null;

  el.focusin(function(e) {
    if (prev) {
      prev.removeAttr('autofocus');
    }
    prev = $(e.target).attr('autofocus', true);
  });
}

//
// 动态参数日志
//
function log() {
  console.log(arguments, new Error().stack);
  // console.log(new Error().stack); // 打印错误堆栈

  var out = [];
  for (var i=0; i<arguments.length; ++i) {
    out.push(arguments[i]);
  }
  out.push('[' + new Date().toLocaleString() + ']');

  var msg = out.join('&nbsp');
  var haserr = (msg.indexOf('错误') >= 0 || msg.indexOf('err') >= 0);

  var sta = $('#__show_state__');
  sta.html(msg);

  if (haserr) {
    sta.removeClass('alert-info').addClass('alert-danger');
    setTimeout(log, 5000);
  } else {
    sta.removeClass('alert-danger').addClass('alert-info');
  }
}


//
// 用 get 方法请求数据
// 通过给 parm.wnid 设置 '1' 可以跳过自动获取 wnid 的步骤
//
function callService(fnName, parm, cb, err_cb) {
  if (!parm) parm = {};
  parm.fn = fnName;
  parm.wnid || (parm.wnid = get_wnid(true));

  $.getJSON("/eeb/service", parm, function(data) {
    if (data.ret != 0) {
      var notmsg = false;
      if (typeof err_cb == 'function') {
        notmsg = err_cb(data);
      }
      if (!notmsg) {
        log('错误:', data.msg);
        eeb.show_msg_box('错误', data.msg, null, 0);
      }
      return;
    }
    cb(data.data);
  });
}


//
// 服务端配合 easyBodyParse
// data - 这是要递交的数据对象
//
function postService(fnName, data, cb, err_cb) {
  var parm = {
    data: JSON.stringify(data),
  }

  var search = 'fn=' + fnName + '&wnid=' + get_wnid(true);

  $.post('/eeb/service?' + search, parm, function(data) {
    if (data.ret /* != 0 && notnull */) {
      log('错误:', data.msg);
      eeb.show_msg_box('错误', data.msg, null, 0);
      err_cb && err_cb(data);
      return;
    }
    cb(data.data);
  }, 'json');
}


//
// 在 sibling_dom 的后面显示一条消息, time 毫秒之后消失
//
function show_msg(sibling_dom, text, time) {
  var dn = '___the_show_message_dom_del';

  var before_del = sibling_dom.data(dn);
  if ( before_del ) before_del();

  $('<span></span>').html(text).insertAfter(sibling_dom).each(function() {
    var t = $(this);

    var tid = setTimeout(function() {
      t.hide(function() {
        var del = sibling_dom.data(dn);
        if (del) del();
      });
    }, time || 4000);

    sibling_dom.data(dn, function() {
      clearTimeout(tid);
      t.remove();
      sibling_dom.removeData(dn);
    });
  });
}


//
// 绑定一个 form 到一个数据模型上
// 每个 input 都与数据模型的一个属性对应, 可以有深层属性
// 当 form 被递交时才把新数据复制到 data_module 中
// 当数据绑定完成 when_over 被调用
// 返回一个函数用于释放内存
// whoclick 是一个 dom 对象
//
function create_bind(data_module, form_selector, when_over) {
  var theform     = $(form_selector);
  var tmp         = {};
  var whoclick    = null;
  var sub         = [];
  var click_time  = 1;
  var ret         = release;

  ret.beginBind = _submit;
  ret.addSub    = _addsub;
  ret.removeSub = _removesub;
  ret.getClickT = getClickTime;

  // 不要复制所有属性
  // jQuery.extend(true, tmp, data_module);

  // 只选择那些表单中会被改变的属性复制
  for (var n in data_module) {
    if ( theform.find("*[name*='" + n + "']").size() > 0 ) {
      tmp[n] = data_module[n];
    }
  }

  theform.find(':input[name]:not(:checkbox)').each(_init_val).change(_change);
  theform.find(':checkbox').each(_init_box).change(_change_box);


  theform.find(':input').click(function() {
    whoclick = this;
    whoclick.__click_time = ret.getClickT();
    // console.log('check click', whoclick.__click_time, whoclick)
  });

  theform.submit(_submit);


  function _init_box() {
    var thiz = $(this);
    thiz.prop('checked', value(thiz.attr('name')) == true);
  }

  function _change_box() {
    var thiz = $(this);
    var v = thiz.prop('checked');
    value(thiz.attr('name'), v, true);
  }

  function _init_val() {
    var thiz = $(this);
    thiz.val( value(thiz.attr('name')) );
  }

  function _change() {
    var thiz = $(this);
    value(thiz.attr('name'), thiz.val(), true);
  }

  function _submit(t) {
    _submit_sub();
    jQuery.extend(true, data_module, tmp);

    var not_pop_msg = when_over && when_over(data_module, whoclick);

    if (t != '__issub') {
      //
      // 原先在按钮旁边显示消息
      // show_msg($(this).children().last(), '请求已发送 ...');
      //
      if (!not_pop_msg) {
        showBox(null, '请求已发送 ...', null, 3);
      }
    } else {
      return whoclick;
    }

    whoclick = null;
    return false;
  }

  function _submit_sub() {
    for (var i=0; i<sub.length; ++i) {
      if (sub[i]) {
        var who = sub[i].beginBind('__issub');

        if (!whoclick) {
          whoclick = who;
        }
        else if (who && who.__click_time > whoclick.__click_time) {
          whoclick = who;
        }
      }
    }
  }

  function _addsub(rel) {
    rel.__sub_index = sub.length;
    rel.getClickT = ret.getClickT;
    sub.push(rel);
  }

  function _removesub(rel) {
    if (rel.__sub_index >= 0) {
      var dsub = sub[ rel.__sub_index ];
      dsub.getClickT = null;
      delete sub[ rel.__sub_index ];
    }
  }

  function value(exp, val, is_set) {
    var as = exp.split('.');
    var o = tmp;

    for (var i=0; i<as.length-1; ++i) {
      o = o[as[i]];
      if (!o) {
        break;
      }
    }

    if (o) {
      var last = o[ as[as.length-1] ];
      if (is_set) {
        o[ as[as.length-1] ] = val;
      }
      return last;
    } else {
      log("在配置中找不到属性, " + exp);
    }
  }

  function getClickTime() {
    return click_time++;
  }

  function release() {
    theform.find(':input[name]').off('change', _change);
    theform.off('submit', _submit);
  }

  return ret;
}


function createJTopoStage() {
  var canvas = document.getElementById('canvas');
  if (!canvas) return;
  // console.log(JTopo);

  var stage = new JTopo.Stage(canvas); // 创建一个舞台对象
  var scene = new JTopo.Scene(stage); // 创建一个场景对象

  // var node = new JTopo.Node("Hello");    // 创建一个节点
  // node.setLocation(11,11);    // 设置节点坐标
  // scene.add(node); // 放入到场景中

  showJTopoToobar(stage);

  return {
    stage: stage,
    scene: scene
  }
}


// 页面工具栏
function showJTopoToobar(stage) {
  // 工具栏按钮处理
  $(".jtopo_toolbar button[name='modeRadio']").click(function(){
    stage.mode = $(this).val();
  });
  $('.jtopo_toolbar #centerButton').click(function(){
    stage.centerAndZoom(); //缩放并居中显示
  });
  $('.jtopo_toolbar #zoomOutButton').click(function(){
    stage.zoomOut();
  });
  $('.jtopo_toolbar #zoomInButton').click(function(){
    stage.zoomIn();
  });
  $('.jtopo_toolbar #exportButton').click(function(){
    stage.saveImageInfo();
  });
  $('.jtopo_toolbar #zoomCheckbox').click(function(){
    if($('.jtopo_toolbar #zoomCheckbox').attr('checked')){
      stage.wheelZoom = 0.85; // 设置鼠标缩放比例
    }else{
      stage.wheelZoom = null; // 取消鼠标缩放比例
    }
  });
  $('.jtopo_toolbar #fullScreenButton').click(function(){
    runPrefixMethod(stage.canvas, "RequestFullScreen")
  });

  // 查询
  $('.jtopo_toolbar #findButton').click(function(){
    var text = $('.jtopo_toolbar #findText').val().trim();
    var nodes = stage.find('node[text="'+text+'"]');

    if(nodes.length > 0){
      var node = nodes[0];
      node.selected = true;
      var location = node.getCenterLocation();
      // 查询到的节点居中显示
      stage.setCenter(location.x, location.y);

      function nodeFlash(node, n){
        if(n == 0) {
          node.selected = false;
          return;
        };
        node.selected = !node.selected;
        setTimeout(function(){
          nodeFlash(node, n-1);
        }, 300);
      }

      // 闪烁几下
      //nodeFlash(node, 6);
    }
  });
}


function runPrefixMethod(element, method) {
  var usablePrefixMethod;
  ["webkit", "moz", "ms", "o", ""].forEach(function(prefix) {
    if (usablePrefixMethod) return;
    if (prefix === "") {
      // 无前缀，方法首字母小写
      method = method.slice(0,1).toLowerCase() + method.slice(1);
    }
    var typePrefixMethod = typeof element[prefix + method];
    if (typePrefixMethod + "" !== "undefined") {
      if (typePrefixMethod === "function") {
        usablePrefixMethod = element[prefix + method]();
      } else {
        usablePrefixMethod = element[prefix + method];
      }
    }
  });

  return usablePrefixMethod;
}

function create_canvas(w, h) {
  var ret = $("<canvas id='canvas' width='" + w + "' height='" + h + "'>");
  $(".user_operate .right .canvas_content").append(ret);
  return ret;
}

function relayout(_create_canvas) {
  var win         = $(window);
  var menu_w      = 200;  // 菜单栏宽度
  var head_inf_h  = 0;    // $('.head_inf').height();
  var tool_bar_h  = 35;
  var left        = $('div[class=left]');
  var canvas      = _create_canvas && _create_canvas(1,1);

  win.resize(onresize);
  onresize();


  function onresize() {
    var h = win.height(),
        w = win.width() - 8;

    $('.head_inf, .tool_bar, .main_frame, .show_state').width(w);

    var tw = w - menu_w,
        th = h - head_inf_h - tool_bar_h - 36;

    $('.user_operate .right').height(th).width(tw);
    left.height(th);

    if (canvas) {
      canvas.attr("width", tw).attr('height', th-6);
    }
  }
}


//
// 一个按钮互斥组, 一个按下, 其他的弹出
// on_css  -- 按下时的样式
// off_css -- 弹起时的样式
//
function button_group(on_css, off_css) {
  var buttons = [];
  var curr = null;

  if (!on_css) {
    on_css = {'background-color' : '#eef'};
  }

  if (!off_css) {
    off_css = {'background-color' : ''};
  }

  //
  // 添加一个 jquery 对象到按钮组中
  //
  function add(jbtn) {
    jbtn.click(_on);
    buttons.push(jbtn);
    _off(jbtn);
  }

  function _on() {
    buttons.forEach(_off);
    curr = $(this).stop(true).animate(on_css, 100);
  }

  function _off(b) {
    b.animate(off_css, 300);
  }

  //
  // 释放内存
  //
  function reset() {
    buttons.forEach(_off);
    buttons.length = 0;
  }

  //
  // 返回当前选择对象, 可以返回 null
  //
  function selector() {
    return curr;
  }

  //
  // 取消选择
  //
  function clear_select() {
    _off(curr);
    curr = null;
  }

  return {
    add           : add,
    reset         : reset,
    selector      : selector,
    clear_select  : clear_select
  };
}


//
// 加载一个文件到页面上, 成功回调 rcb
// 自动附加一个 dom 允许重复引入同一个文件,
// 重复加载同一个文件只保留最后的实例!
//
function load_file(pageurl, rcb, _fail_rcb) {
  //
  // 缓存仅用于当再次请求前删除之前的 dom
  //
  var _id_cache = window.load_file___page_id_cache;
  if (!_id_cache) {
    _id_cache = window.load_file___page_id_cache = { __id: 1 };
  }

  var _id = _id_cache[pageurl];
  if (_id) {
    $('#' + _id).remove('*');
  }

  $.ajax(pageurl, {
    dataType   : 'html',
    error      : _fail_rcb || _fail,
    success    : _success,
    global     : false,
    async      : true,
    ifModified : true,
  });

  function _success(dat) {
    if (!_id) {
      _id = _id_cache[pageurl] = _id_cache.__id++;
    }

    var jdom = $('<div id="' + _id + '">' + dat + '</div>');
    $(document.body).append(jdom);
    rcb(jdom);
  }

  function _fail() {
    // console.log.apply(console, arguments);
  }
}


//
// 在 _jroot 中生成分页标签, 分页数量由 count 指定
// 点击后回调 change_page_fn
//
// count -- 总页数, 可以是小数
// curr  -- 当前页 从 1开始
// change_page_fn -- Function(page_index)
//
function pagination(_jroot, count, curr, change_page_fn) {
  var _frame = $('<div class="col-sm-12 text-right">'
      + '<div class="dataTables_paginate paging_bootstrap">'
      + '<ul class="pagination"></ul></div></div>');

  _jroot.html(_frame);

  var DISPLAY_COUNT = 10;
  var _jpage = _jroot.find('.pagination');
  var arr = [];

  if (count % 1 > 0) {
    count = parseInt(count) + 1;
  }

  _add('<li class="prev"><a href="#">前一页</a></li>', curr - 1);

  var begin = Math.max(1, curr-5),
      end = Math.min(count, curr+5);

  for (var i=begin; i<=end; ++i) {
    _add('<li><a href="#">' + i + '</a></li>', i);
  }

  _add('<li class="next"><a href="#">后一页</a></li>', curr + 1);


  function _add(html, pc) {
    var jdom = $(html);
    _jpage.append(jdom);
    arr[pc] = jdom;

    if (pc < 1 || pc > count) {
      jdom.addClass('disabled');
    }

    if (pc == curr) {
      jdom.addClass('active');
    }

    jdom.click(function() {
      if (pc != curr && pc > 0 && pc <= count) {
        change_page_fn(pc);
      }
    });
  }
}


//
// 初始化一个编辑器, 从 jform_root 中寻找 dom_selector 选择的 dom
// jform_root 必须是一个 form 标签 dom_selector 必须选择一个 input 标签
// 并且有 name 属性, rc 映射了form中的数据, 存储和读取针对 rc[name] 操作
// type = 'sql' | 'javascript'
// 如果选择器唯一的选择一个 dom 返回创建的编辑器对象
// 如果选择了多个对象, 则返回编辑器数组
//
// 使用该方法, 会自动引入脚本:
// <script src="js/lib/ace/ace.js"></script>
// <script src="js/lib/ace/mode-sql.js"></script>
// <script src="js/lib/ace/mode-javascript.js"></script>
//
function create_ace_editor(rc, jform_root, dom_selector, type) {
  var is_full_screen = false;
  var editors = [];
  var js_file = [ 'js/lib/ace/ace.js',
                  'js/lib/ace/mode-' + type + '.js', ];


  js_file.forEach(function(fname) {
    jform_root.append('<script src="' + fname + '"></script>');
  });

  jform_root.find(dom_selector).each(function() {
    var thiz = $(this);
    var name = thiz.attr('name');

    var _editor = ace.edit(this);
    window.ed = _editor;

    var _mode = ace.require("ace/mode/" + type).Mode;
    _editor.getSession().setMode(new _mode());
    _editor.setValue(rc[name]);
    _editor.clearSelection();


    thiz.change(function() {
      _editor.setValue(thiz.val());
      _editor.clearSelection();
    });

    jform_root.submit(function() {
      rc[name] = _editor.getValue();
    });

    // console.log('ace', _editor);
    editors.push(_editor);
  });

  //
  // fn_name -- 包装函数名
  // next_fn -- 调用另一个包装函数, 应该是空参数函数
  //
  function pack_fn(fn_name, next_fn) {
    var ret = null;
    var arg = null;

    return function() {
      arg = arguments;
      editors.forEach(do_fn);
      if (next_fn) {
        ret = next_fn(arg);
      }
      return ret;
    };

    function do_fn(_editor) {
      ret = _editor[fn_name].apply(_editor, arg);
    }
  }


  function fullScreen() {
    if (is_full_screen) return;
    is_full_screen = true;

    //
    // 这里依赖外层对象是一个对话框, 才能获取正确的滚动条对象
    //
    var jscroll = jform_root.parents('.ui-dialog-content');
    var scrollTop = jscroll.scrollTop();
    jform_root.hide();

    editors.forEach(fs);


    function _show_root() {
      jform_root.show();
      jscroll.scrollTop(scrollTop);
      is_full_screen = false;
    }


    function fs(ed) {
      var dom = $('<pre/>');
      var closer = $('<button class="fullScreenClose btn btn-default">退出全屏</button>');
      //
      // 在 body 之前安装元素, 可以防止被其他组件拦截事件
      //
      $(document.body).prepend(dom).prepend(closer);

      dom.each(function() {
        var editor = ace.edit(this);
        editor.getSession().setMode( ed.getSession().getMode() );
        edit_to_edit(editor, ed);

        var cont = $(editor.container).addClass('fullScreen');
        editor.setAutoScrollEditorIntoView(false);
        editor.resize();

        //
        // 使用底层 api 才能正确捕获/拦截键盘事件
        //
        document.body.addEventListener('keydown', _check_key, true);
        closer.one('mousedown', _close);
        closer.one('click', _close);


        function _check_key(ev) {
          switch (ev.keyCode || ev.which) {
            case 27: // ESC
              _close();
              break;
          }
        }

        function edit_to_edit(_to, _from) {
          _to.setValue( _from.getValue() );
          _to.moveCursorToPosition( _from.getCursorPosition() );
          _to.clearSelection();
          _to.focus();
        }

        function _close() {
          document.body.removeEventListener('keydown', _check_key);
          _show_root();
          edit_to_edit(ed, editor);
          cont.remove();
          dom.remove();
          closer.remove();
        }
      });
    }
  }

  return {
    insert      : pack_fn('insert'),
    setValue    : pack_fn('setValue', pack_fn('clearSelection')),
    getValue    : pack_fn('getValue'),
    fullScreen  : fullScreen
  };
}


//
// 用 tree 画面显示 json 结构,
// html 代码 push 到 html 参数中, 默认树状结构是隐藏的
// 并且没有绑定按钮事件, (使用 bind_tree_event 绑定按钮)
//
function json2treeui(html, json, user_tv, _display) {
  var _     = function(t) { html.push(t); return _; };
  var deep  = [];
  var TV    = user_tv || DEFAULT_TV;
  var visi  = _display ? '' : "style='display:none'";
  var icon  = _display ? 'fa-folder-open-o' : 'fa-folder';


  _('<div class="tree">')('<ul role="tree">');
    out_object('流数据', function() {
      for (var n in json) {
        add_item(json[n], n);
      }
    }, true);
  _('</ul>')('</div>');


  function TN(_name) {
    var truename = deep.join('.');
    return _('<a href="#" truename="')(truename)('">')(_name)('</a>');
  }

  function DEFAULT_TV(_val, _name, _path) {
    return _("<b class='note'>")(_val)("</b>");
  }

  function safe_html_display(txt) {
    // 利用 jQuery 的方法输出安全字符
    return $('<a/>').text(txt).html();
  }

  function out_value(name, val) {
    _('<li ')(visi)('><span><i class="icon-leaf"></i> ');
    TN(name)('</span>');
    if (val) {
      _(" - "); TV(val, name, deep.join('.'));
    }
    _('</li>');
  }

  function out_object(name, fn, _root) {
    _('<li ')(_root || visi)(' class="parent_li" role="treeitem">');
    _('<span title="Collapse this branch"><i class="fa fa-lg ')(icon)('"></i> ');
    _root ? _(name) : TN(name);
    _('</span>');

    _('<ul role="group">');
    fn();
    _('</ul></li>');
  }

  function add_item(obj, name) {
    deep.push(name);

    if (!obj) {
      out_value(name, null);
    }
    else if (typeof obj == 'string') {
      out_value(name, safe_html_display(obj));
    }
    else if ((!isNaN(obj)) || typeof obj == 'boolean') {
      out_value(name, obj);
    }
    else if (obj.constructor === Date) {
      out_value(name, obj.toString());
    }
    else if (typeof obj == 'object') {
      out_object(name, function() {
        if (obj.constructor === Array) {
          obj.forEach(add_item);
        } else {
          for (var n in obj) {
            add_item(obj[n], n);
          }
        }
      });
    }

    deep.pop();
  }
}


//
// 绑定树状组件的展开事件, jdom 必须 class=tree
//
function bind_tree_event(jdom) {
  if (!jdom.hasClass('.tree')) {
    jdom = jdom.find('.tree');
  }

  if (jdom.attr('tree-event-binded')) {
    return;
  }

  jdom.attr('tree-event-binded', true);

  jdom.find('span[title="Collapse this branch"]').on('click', function(e) {

    var children = $(this).parent('li.parent_li').find(' > ul > li');
    if (children.is(':visible')) {
      children.hide('fast');
      $(this).attr('title', 'Expand this branch').find(' > i')
             .removeClass().addClass('fa fa-lg fa-folder');
    } else {
      children.show('fast');
      $(this).attr('title', 'Collapse this branch').find(' > i')
             .removeClass().addClass('fa fa-lg fa-folder-open-o');
    }

    e.stopPropagation();
  });
}


//
// 在 jroot 中选择 in_sel/out_sel 如果 in 改变 out 也随之改变
// 除非 out 被手动编辑, 此时同步被取消
//
function out_val_flow_in(jin, jout) {
  // var jout = jroot.find(':input[name=fout]');
  // var jin  = jroot.find(':input[name=fin]');
  if (jout.val() != '') return;

  jin.change(flow_val);
  jout.keydown(unbind);

  function unbind() {
    jin.off('change', flow_val);
    jout.off('keydown', unbind);
  }

  function flow_val() {
    jout.val( $(this).val() ).trigger('change');
  }
}


//
// 在 _jroot 中寻找 含有 select_file 属性的 button 作为文件选择按钮
// 当用户选择了文件后, 把文件名推入 name属性 与 select_file 相等的
// input 对象中 (必须在同一个 dom 元素)
//
function select_file_from_pool(_jroot) {
  _jroot.find('button[select_file]').click(function() {
    var thiz   = $(this);
    var target = _jroot.find(':input[name="' + thiz.attr('select_file') + '"]');

    eeb.load_file('file-pool.htm', function() {
      eeb.open_file_pool({
        no_upload   : true,
        no_download : true,
        no_delete   : true,
        no_replace  : true,
        buttons     : { '选择文件' : select_file }
      });

      function select_file(jdialog, filedata) {
        jdialog.dialog('close');
        target.val(filedata.tf).trigger('change');
      }
    });
  });
}


//
// 在 jroot 中寻找 change_type 属性的按钮, 按下后修改
// jroot 中 input.name==_type 的对象的值
// `_type` 是约定属性
//
function change_type_button(jroot, eeb_work, rc) {
  var _type = jroot.find(':input[name=_type]');
  if (_type.length < 1) return;

  eeb_work.when_close(function() {
    rc._type = '';
  });

  jroot.find('*[change_type]').click(function() {
    var t = $(this).attr('change_type');
    _type.val(t).trigger('change');
  });
}


//
// 在父元素中寻找表单, 拼装为查询条件返回
// 失败返回 null
//
function getParentFormParm(jdom) {
  var ret;

  jdom.parents('form').each(function() {
    ret = ret || {};
    var form = $(this);

    form.find(':input').each(function() {
      var input = $(this);
      var type = input.attr('type');

      if (type == 'checkbox' || type == 'radio') {
        if (!input.prop('checked')) return;
      }

      if (input.attr('name')) {
        ret[ input.attr('name') ] = input.val();
      }
    });
  });
  // console.log(ret)
  return ret;
}


//
// 创建一个旋转按钮
// rotate -- 按下后旋转的 jsom 对象
// return { being: 开始旋转, stop: 停止旋转 }
//
function create_rotate(rotate) {
  var ro = 1;
  var tid;

  return {
    begin : begin_rotate,
    stop  : stop
  }

  function begin_rotate() {
    if (tid) return;
    tid = setInterval(function() {
      rotate.css({'transform': 'rotate(' + ro + 'deg)' });
      ro += 25;
      if (ro >= 360) ro = 0;
    }, 25);
  }

  function stop() {
    setTimeout(function() {
      clearInterval(tid);
      tid = 0;
    }, 600);
  }
}


//
// 获取 wnid(work node id),
// 1. 参数中必须有 wnid 的参数, 使用之, 或
// 2. 页面上必须有 id=__wnid 的元素获取其 html
// _not_error -- true 找不到参数则返回 null, 否则会抛出异常
//
function get_wnid(_not_error) {
  var cache = this;

  if (cache.wnid) {
    // console.log('wnid cache');
    return cache.wnid;
  } else {
    return planA() || planB() || planC();
  }

  function planA() {
    var p = 'wnid=';
    var s = location.search;
    var a = s.indexOf(p);
    if (a > 0) a += p.length;
      else return;

    var b = s.indexOf('&', a);
    if (b < 0) b = s.length;

    return cache.wnid = s.substring(a, b);
  }

  function planB() {
    return cache.wnid = $('#__wnid').html();
  }

  function planC() {
    var msg = '找不到 wnid 参数';
    if (_not_error) {
      console.log(msg);
      return;
    }
    // console.log( new Error().stack );
    throw new Error(msg);
  }
}


//
// 解析 url
//
// return {
//   search: '参数字符串',
//   url   : '不含有请求参数的 url 部分',
//   query : '解析后的请求参数',
// }
//
function parse_url_parm(_url) {
  var ret = {
    search   : '',
    url      : '',
    query    : {},
    host     : '',
    port     : 80,
    path     : '/',
    protocol : '',
  };

  var s, c, b = 0, key, v;

  if (_url) {
    ret.url = _url;
    c = _url.indexOf('?');
    if (c > 0) {
      var sh = ret.search = _url.substr(c+1);
      var hp = _url.substring(0, c);
      parse_host_port(hp);
      parse_query(sh);
    } else {
      parse_host_port(_url);
    }
  } else {
    ret.host     = location.hostname;
    ret.port     = Number(location.port);
    ret.url      = location.href;
    ret.path     = location.pathname;
    ret.protocol = location.protocol;
    var sh       = location.search;
    if (sh[0] == '?') sh = sh.substr(1);
    ret.search = sh;
    parse_query(sh);
  }

  function parse_query(s) {
    b = 0;
    for (var i=b, e=s.length; i<e; ++i) {
      c = s[i];
      if (c == '=') {
        key = s.substring(b, i);
        b = i+1;
        continue;
      }
      if (c == '&') {
        ret.query[key] = s.substring(b, i);
        key = null;
        b = i+1;
        continue;
      }
    }
    if (key) {
      ret.query[key] = s.substring(b);
    }
  }

  function parse_host_port(o) {
    b = o.indexOf('//');
    if (b > 0) {
      ret.protocol = o.substring(0, b);
      b += 2;
      v = o.indexOf(':', b);
      if (v > b) {
        ret.host = o.substring(b, v);
        c = o.indexOf('/', v);
        if (c < 0) c = o.length;
        ret.port = parseInt(o.substring(v+1, c));
        if (c < o.length) {
          ret.path = o.substr(c);
        }
      } else {
        c = o.indexOf('/', b);
        if (c > b) {
          ret.host = o.substring(b, c);
          if (c < o.length) {
            ret.path = o.substr(c);
          }
        } else {
          ret.host = o.substring(b);
        }
      }
    } else {
      throw new Error('unknow url: ' + ret.url);
    }
  }

  return ret;
}


//
// 创建 options 选项
//
function createOptions() {
  var html = [], _ = function(t) { html.push(t); return _; };

  return {
    //
    // 压入 val name
    //
    push : function(val, name) {
      _('<option value="')(val)('">')(name)('</option>');
    },

    //
    // 返回 html 代码
    //
    html : function() {
      return html.join('');
    },

    //
    // 把 options 选项压入 jdom 中
    //
    setto : function(jdom) {
      jdom.html(this.html());
    }
  }
}


//
// 来自 configuration-lib
// 深度复制对象, 并返回结果
// jquery 并不支持深度复制
//
function _extends() {
  var _undefined;
  var ret = {};
  var al = arguments.length;

  for (var i=0; i<al; ++i) {
    copy(ret, arguments[i]);
  }

  function copy(a, b) {
    for (var n in b) {
      if (b[n] === null || b[n] === _undefined) continue;
      if (typeof b[n] == 'object') {
        if (b[n].constructor == Array) {
          if (!a[n]) a[n] = [];
        } else {
          if (!a[n]) a[n] = {};
        }
        copy(a[n], b[n]);
      }
      else {
        a[n] = b[n];
      }
    }
  }
  return ret;
}


//
// 当前页面按下后退时, 弹出提示
// 初始时, 未改动
//
function not_back_event() {
  var is_bind = false;

  //
  // 用户有改动, 离开页面则弹出提示
  //
  function _change() {
    if (is_bind) return;
    is_bind = true;
    $(window).bind('beforeunload', _beforeunload);
  }

  //
  // 改动已保存, 可以安全离开页面
  //
  function _save() {
    is_bind = false;
    $(window).unbind('beforeunload', _beforeunload);
  }

  function _beforeunload() {
    return '当前页面内容尚未保存，离开后会丢失修改, 请首先保存';
  }

  return {
    change : _change,
    save   : _save,
  }
}


var __ = '%A9%202014-2015%20%u667A%u878DIT%20%7C%20%20%u8FBDICP%u590715008303%u53F7';
console.log(unescape(__));
});
