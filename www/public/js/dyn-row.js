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
(function() {

// 依赖 export-fn.js

eeb.dyn_row                   = dyn_row;
eeb.select_field_from_flow    = select_field_from_flow;
eeb.radio_visibility          = radio_visibility;
eeb.input_val_not_in_flow     = input_val_not_in_flow;
eeb.zip                       = zip;
eeb.select_path_from_conf     = select_path_from_conf;
eeb.select_field_from_table   = select_field_from_table;


//
// 从 _jparnet 寻找 flowdata_to_rowname 属性的标签, 并在该标签按下后, 弹出
// 选择字段对话框, 当字段被选择, 使用 flowdata_to_rowname 属性的值作为选择器
// 在 _jparnet 中寻找 rowname==flowdata_to_rowname 的输入表单并设置它的值
// eeb_work 是框架提供的对象
//
// * 运行函数式用法
//
function select_field_from_flow(_jparnet, eeb_work) {
  _jparnet.find('*[flowdata_to_rowname]').click(open_dialog);

  return {
    //
    // 提供一个函数来获取 流中的数据
    // getter_fn -- Function(val -- 流中属性的表达式)
    //
    open_dialog : function(getter_fn) {
      open_dialog(null, null, getter_fn);
    }
  };

  function open_dialog(_1, _2, getter_fn) {
    // 这可以是一个函数
    var row_name = getter_fn || $(this).attr('flowdata_to_rowname');

    eeb_work.parent_data(function(err, data) {
      if (err) {
        return; // eeb.show_msg_box(null, err.message || err);
      }

      if (data.className == 'etl_data') {
        etl_data(data, row_name);
      } else if (data.className = 'esb_data') {
        esb_data(data, row_name);
      } else {
        var msg = "错误: 无法处理的类型, " + data.className;
        eeb.show_msg_box(null, msg);
        throw new Error(msg);
      }
    });
  }

  function esb_data(data, row_name) {
    var html = [];
    eeb.json2treeui(html, data.data, null, true);

    var dialog = open_select_dialog(html, row_name, function(select_jdom) {
      return select_jdom.attr('truename');
    });
    
    eeb.bind_tree_event(dialog);
  }

  function etl_data(data, row_name) {
    var html = [], 
        _ = function(s) { html.push(s); return _; };

    for (var i=0; i<data.head.length; ++i) {
      _('<p><a href="#">')(data.head[i])('</a>&nbsp;&nbsp;&nbsp;');
      _('<span class="note">')(data.type[i])('</span>');
      _('</p>');
    }

    open_select_dialog(html, row_name, function(select_jdom) {
      return select_jdom.html();
    });
  }

  function open_select_dialog(html, row_name, val_getter) {
    var opt = { width: 'auto', title: '选择一个字段' };
    var dialog = eeb.easy_dialog(html.join(''), _jparnet, opt);
    dialog.css({ 'min-width': '400px' });

    dialog.find('a').click(function() {
      var thiz = $(this);
      var val = val_getter(thiz);

      // eeb.show_msg_box(null, val);
      if (val) {
        if (typeof row_name == 'function') {
          row_name(val);
        } else {
          _jparnet.find('*[rowname="' + row_name + '"]')
                  .val(val)
                  .trigger('change');
        }

        dialog.dialog('close');
      } else {
        eeb.show_msg_box(null, '选项无效!');
      }
    });

    return dialog;
  }
}


//
// 服务端配合 dbtool.get_fields
// 从返回的数据 data 中选择一个字段赋值到 jtext.val()
//
function select_field_from_table(root, data, jtext) {
  var html = [], 
           _ = function(s) { html.push(s); return _; };

  data.fields.forEach(function(f, i) {
    _('<p><a href="#">')(f.field)('</a>&nbsp;&nbsp;&nbsp;');
    _('<span class="note">')(f.typename)('</span>');
    _('</p>');
  });
  
  var opt = { width: '500px', title: '选择一个表字段' };
  var dialog = eeb.easy_dialog(html.join(''), root, opt);

  dialog.find('a').click(function() {
    jtext.val( $(this).html() ).trigger('change');
    dialog.dialog('close');
  });
}


//
// 选择目标路径
// 寻找 select_path_to_rowname 属性的按钮, 并初始化这个属性对应的
// rowname 相同值的输入表单, 与之关联, 当按钮按下, 弹出选择列表
// _when_selected -- 可选参数, 当路径被选择时调用 Function(tid, name, oldtid)
//
function select_path_from_conf(_jparnet, eeb_work, _when_selected) {
  var cp = eeb_work.child_path();

  _jparnet.find('*[select_path_to_rowname]')
          .click(open_dialog)
          .each(init_disp);

  function init_disp() {
    var row_name   = $(this).attr('select_path_to_rowname');
    var true_input = _jparnet.find('*[rowname="' + row_name + '"]');
    var disp_input = $('<input />');

    disp_input.attr('placeholder', true_input.attr('placeholder'));
    disp_input.val( cp[true_input.val()] );

    true_input.before(disp_input);
    true_input.hide();
    true_input.data('disp_input', disp_input);
  }

  function open_dialog(event) {
    var row_name   = $(this).attr('select_path_to_rowname');
    var true_input = _jparnet.find('*[rowname="' + row_name + '"]');
    var disp_input = true_input.data('disp_input');

    var html = [], 
        _ = function(s) { html.push(s); return _; };

    var count = 0;

    for (var tid in cp) {
      _('<p><a href="#" tid="')(tid)('">')(cp[tid])('</a>&nbsp;&nbsp;&nbsp;');
      _('<span class="note">')(tid)('</span>');
      _('</p>');
      ++count;
    }

    if (count == 0) {
      _("<h3>没有可以选择的路径</h3>");
    }
    
    var opt = { width: '500px', title: '选择一个路径' };
    var dialog = eeb.easy_dialog(html.join(''), _jparnet, opt);

    dialog.find('a').click(function() {
      var thiz = $(this);
      var oldval = true_input.val();

      true_input.val( thiz.attr('tid') ).trigger('change');
      disp_input.val( thiz.html() );
      dialog.dialog('close');

      if (_when_selected) {
        _when_selected(thiz.attr('tid'), thiz.html(), oldval);
      }
    });
  }
}


//
// config -- 数据模型
// template_select -- 选择要复制行的模板
// add_select      -- 添加按钮
// appender        -- 容器, 新行添加到器中
// parent_bind     -- 使用 eeb.create_bind 创建的对象, 接受这个容器的递交事件
// when_newrow     -- Function(new_row_jquery_obj, data) 
//                    当新行被创建回调, data 是通过函数调用传递的参数
//                    当行被删除前, new_row_jquery_obj 会触发 'row_del_pre' 事件
//                    当行中元素被删除后, 触发 'row_del_after' 事件
// not_auto        -- true: 不自动生成行
//
// 返回的对象用于函数调用
//
// 行中的 rowname='Xx' 的属性会扩展成 name='Xx.N', 并与 config 中的属性绑定
// 行中的 class=='del' 标签用来删除当前行
//
function dyn_row(config, template_select, add_select, appender, 
                 parent_bind, when_newrow, not_auto) {

  var rowTemplate = $(template_select);
  var id          = -1;
  var rownames    = [];


  if (not_auto !== true) {
    rowTemplate.find('*[rowname]').each(function() {
      rownames.push($(this).attr('rowname'));
    });
    check_attr();
    create_from_config();
  }

  $(add_select).click(add_row);


  function check_attr() {
    for (var i=0; i<rownames.length; ++i) {
      if (id < 0) {
        id = config[ rownames[i] ].length;
      } else {
        if (id != config[ rownames[i] ].length) {
          console.log('config', config)
          throw new Error("config 长度错误");
        }
      }
    }
  }

  function create_from_config() {
    for (var i=0; i<id; ++i) {
      add_row(i);
    }
  }

  //
  // 使用模板插入一行数据, _row_id 绝对行 id 影响 input.name 的后缀
  // _data 被传递给 when_newrow 的第二个参数
  //
  function add_row(_row_id, _data) {
    var row = rowTemplate.clone();
    var _id = isNaN(_row_id) ? id++ : _row_id;
    var rowdata = {};

    appender.append(row);
    eeb.auto_form_ui(row);
    row.show();

    row.find('*[rowname]').each(function() {
      var t = $(this);
      t.attr('name', t.attr('rowname') + '.' + _id);
      rowdata[t.attr('rowname')] = t.val();
    });

    for (var i=0; i<rownames.length; ++i) {
      var v = config[ rownames[i] ][_id];
      if (v === undefined || v === null) {
        config[ rownames[i] ][_id] = '';
      }
      rowdata[rownames[i]] = config[ rownames[i] ][_id];
    }

    var bind = eeb.create_bind(config, row);
    parent_bind.addSub(bind);


    row.find('.del').click(function() {
      row.trigger('row_del_pre');
      row.find('*[rowname]').each(function() {
        $(this).val('').trigger('change');
      });
      // 不许要另外删除
      // for (var i=0; i<rownames.length; ++i) {
      //   config[ rownames[i] ][_id] = null;
      // }
      parent_bind.removeSub(bind);
      row.empty();
      row.trigger('row_del_after');
      row.remove();
    });

    if (when_newrow) {
      when_newrow.call(this, row, _data, _id, rowdata);
    }
    // when_newrow && when_newrow();
  }

  //
  // 返回的对象用于操作行数据
  //
  return {
    add_row : add_row
  }
}


var radio_id = 1;

//
// 互斥选择, 并通过 ctrl 控制相同 class 属性的标签的显示
//
// jradios -- 同一个组中的互斥按钮, 不需要有相同的 name
// jparent -- 被控标签所在容器 class 属性要和 ctrl 相同
// init_show -- 初始化后, init_show 被调用, 当标签的 ctrl 与返回值相同, 则这个标签被选择
// cb -- Function(showclass, hideclass) 告诉回调那些被显示, 那些被隐藏
//
function radio_visibility(jradios, jparent, init_show, notify_cb) {
  var _name = 'exjne_' + (++radio_id);
  var all = [];
  var disp = null;

  jradios.each(function() {
    var tz = $(this);
    var ctrl = tz.attr('ctrl');
    all.push(ctrl);
    tz.attr('name', _name);

    tz.click(function() {
      sw_disp(ctrl);
    });

    if (tz.prop('checked')) {
      disp = ctrl;
    }
  });

  if (init_show) {
    sw_disp(init_show());
  } else {
    sw_disp(disp);
  }

  function sw_disp(visi_name) {
    var hide = [];

    for (var i=0; i<all.length; ++i) {
      if (all[i] != visi_name) {
        jparent.find('.' + all[i]).css({ 'visibility': 'hidden' });
        hide.push(all[i]);
      }
    }

    jparent.find('.' + visi_name).css({ 'visibility': 'visible' });
    jradios.filter('*[ctrl=' + visi_name + ']').prop('checked', 'true');
    notify_cb && notify_cb(visi_name, hide);
  }
}


var flow_head = false;

//
// jinput 输入的字段在流中, 则提示用户禁止这样操作
// 并且拦截 jsubmit 的递交操作
//
function input_val_not_in_flow(jinput, jsubmit, eeb_work) {

  var target_field_vif = false;

  if (!flow_head) {
    eeb_work.parent_data(function(err, data) {
      if (err) {
        target_field_vif = false;
        return eeb.easy_dialog(err.message || err, input_selector);
      }

      flow_head = {};

      data.head.forEach(function(fi, i) {
        flow_head[ fi.toLowerCase() ] = true;
      });
      _check_input();
    });
  } else {
    _check_input();
  }

  jinput.change(_check_input);
  jinput.keyup(_check_input);

  function _check_input() {
    if (!flow_head) {
      target_field_vif = false;
      eeb.show_msg(jinput, "正在加载数据...");
      return;
    }

    if (flow_head[ jinput.val().toLowerCase() ]) {
      target_field_vif = false;
      eeb.show_msg(jinput, "不能与流中字段重名");
    } else {
      target_field_vif = true;
    }
  }

  // 如果目标字段无效, 拦截递交
  jsubmit.click(function() {
    return target_field_vif;
  });
}


//
// 去掉数组中的空列
// zip(conf, 'att1', 'att2', ...)
//
function zip(conf) {
  var arg = arguments;
  var firstArr = conf[ arg[1] ];

  for (var i=0; i<firstArr.length; ++i) {
    if (!firstArr[i]) {
      for (var a = 1; a < arg.length; ++a) {
        conf[ arg[a] ].splice(i, 1);
      }
      --i;
    }
  }
}


})();