jQuery(document).ready(function($) {

eeb.init_flow_canvas(function(show, rc, jtopo, ext_event) { 
  var varnish_config = { targets:{} };
  var vid = eeb.parse_url_parm().query.vid;
  var item_html = $('#__varnish_item_template').html();


  //
  // 禁止从菜单拖入目标模块
  //
  var jvarnish_list = $('#__function_list').html('');


  //
  // 禁止移动画板中的目标/删除目标/删除连线/改动连线
  // 使用 jtopo.scene.getDisplayedElements 无法获取所有元素
  //
  for (var z in jtopo.scene.zIndexMap) {
    jtopo.scene.zIndexMap[z].forEach(function(e) {
      e.dragable = false;
      e.editAble = false;
    });
  }

  ext_event.on('edit-node-menu-created', function(event, node_edit) {
    node_edit.find('.link').remove();
    node_edit.find('.del').remove();
    node_edit.find('.add_link_div').remove();
  });


  //
  // 禁止编辑便签
  //
  $('.__edit_note_dialog')
      .find('textarea')
      .prop('readonly', true);

  $('.__edit_note_dialog')
      .find('button.ok')
      .remove();


  //
  // 禁止测试/运行/终止/历史记录
  //
  $('#__save_and_test')
      .add('#__save_and_invoke')
      .add('#__bt_stop')
      .add('#__bt_history')
      .add('.node-edit-button')
      .remove();


  //
  // 拦截保存动作
  //
  ext_event.on('config-change', function(e, config, run_config) {
    // console.log( config )
    add_config(config, run_config);
  });

  var save_button = $('#__save_run_config')
      .off('click')
      .click(save_varnish);

  var help_button = $('<button class="btn btn-info btn-xs addbutton">帮助</button>');
  save_button.after(help_button);
  help_button.click(open_help);


  //
  // 初始化一定要显示画板
  //
  load_varnish(function(data) {
    varnish_config = data;
    build_v_list();
    show();
  });


  //
  // 功能函数 ---------------------------------------------------------- //
  //

  function load_varnish(rcb) {
    eeb.callService('load_vc', {vid: vid}, function(data) {
      rcb(data);
    }, function(err) {
      eeb.easy_dialog('获取配置失败, 新的特例');
      rcb({ targets:{} });
    });
  }


  function save_varnish() {
    var data = {
      vid : vid,
      vc  : JSON.stringify(varnish_config),
    };
    eeb.postService('save_vc', data, function(d) {
      eeb.show_msg_box(null, d);
    });
  }


  function build_v_list() {
    jvarnish_list.html('<h6>特例模式配置列表</h6>');

    //
    // 利用配置创建列表
    //
    for (var n in varnish_config.targets) {
      add_config_jdom(n);
    }
    //
    // 应用配置到模板
    //
    for (var tid in rc.targets) {
      var tar = rc.targets[tid];
      var src = varnish_config.targets[ tar.run_config.name ];
      if (src) {
        tar.run_config = eeb.extends(tar.run_config, src.run_config);
      }
    }
  }


  function add_config(conf, run_config) {
    // 禁止修改名称
    if (run_config.name !== conf.run_config.name) {
      eeb.show_msg_box(null, '错误: 禁止修改名称, 名称已经还原');
    }

    var n = run_config.name = conf.run_config.name;
    var c = varnish_config.targets[n];

    if (c) {
      c.run_config = get_run_config();
    } else {
      varnish_config.targets[n] = {
        programID  : conf.programID,
        run_config : get_run_config(),
      }
      add_config_jdom(n);
    }

    //
    // 只保存被修改的属性, 支持深度探测/复制
    //
    function get_run_config() {
      var rcc = {};
      for (var nn in run_config) {
        _loop(conf.run_config, run_config, rcc, nn);
      }

      function _loop(oldc, newc, toc, n) {
        if (oldc[n] !== newc[n]) {
          if (newc[n] && oldc[n]) {

            if (newc[n].constructor === Array) {
              if (!toc[n]) toc[n] = [];
              newc[n].forEach(function(_, i) {
                _loop(oldc[n], newc[n], toc[n], i);
              });
              return;

            } else if (newc[n].constructor === Object) {
              if (!toc[n]) toc[n] = {};
              for (var k in newc[n]) {
               _loop(oldc[n], newc[n], toc[n], k);
              }
              return;

            }
          }
          toc[n] = newc[n];
        }
      }
      return rcc;
    }
  }


  function add_config_jdom(name) {
    var state = get_state(name);
    var item = $(item_html);
    jvarnish_list.append(item);

    item.find('.name').html(name);
    item.find('.state').html(state.text).addClass(state.ltype);
    item.filter('.alert').addClass(state.atype);

    item.find('.delete').click(function() {
      delete varnish_config.targets[name];
      item.slideUp(function() {
        item.remove('*');
      });
    });
  }


  function get_state(name) {
    var target;

    for (var tid in rc.targets) {
      if (rc.targets[tid].run_config.name == name) {
        target = rc.targets[tid];
        break;
      }
    }

    if (!target) 
      return _msg('danger', '不存在同名目标');

    if (varnish_config.targets[name].programID !== target.programID)
      return _msg('warning', '程序类型不匹配');

      return _msg('info', '正常');

    function _msg(type, msg) {
      return {
        text  : msg,
        ltype : 'label-' + type,
        atype : 'alert-' + type,
      }
    }
  }


  function open_help() {
    var help_html = $('#__varnish_help').html();
    eeb.easy_dialog(help_html, null, {
      title  : '帮助',
      width  : '80%',
      height : '500',
    });
  }

});

});