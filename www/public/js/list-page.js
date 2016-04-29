jQuery(document).ready(function($) {

var type = parseInt( $('#__page_class_name_type').html() );
var UPDATE_TIME = 15000;
var create_rotate = eeb.create_rotate;


//
// 所有页面的主表格都叫 job_list ...
//
$('.job_list:not([url])').each(function() {
  var thiz = $(this);
  // 复制这个属性, table_data_source 依赖
  thiz.attr('url', thiz.attr('data_url'));

  eeb.table_data_source(thiz,
      update_run_state, update_run_state, when_node_offline);
});


function when_node_offline(data) {
  var jump_wait = 3 * 1000;

  if (data.msg.indexOf("离线") >= 0) {
    var pg = eeb.easy_progress({
      autoBegin : true,
      title     : '即将跳转',
      label     : '节点已经重启或离线, 即将返回上层页面' });

    setTimeout(function() {
      pg.end();
      location.href = 'list-node.htm';
    }, jump_wait);
  }
}


//
// 寻找 update_list 用 data_url 请求数据创建表格
// 再利用 update_selector_button 寻找到的按钮作为刷新
//
$('.update_list').each(function() {
  var thiz = $(this);
  // 复制这个属性, table_data_source 依赖
  thiz.attr('url', thiz.attr('data_url'));

  eeb.table_data_source(thiz, function(td) {
    var button = $(thiz.attr('update_selector_button'));
    var rotate = create_rotate(button.find('i'));

    setInterval(function() {
      button.trigger('click');
    }, UPDATE_TIME);

    button.click(function() {
      rotate.begin();
      td.update(function() {
        rotate.stop();
      });
    });
  }, null, when_node_offline);
});


//
// class = update_job_list 的按钮按下后会刷新状态
// 请求参数中 rid 属性收集了所有行的主键
// 从每行的 tr[role='row' || class='key'] 对象中的 html 中收集主键
//
function update_run_state() {
  var rotate   = create_rotate($('.update_job_list_rotate'));
  var thiz     = $('.job_list');
  var parm     = { rid:[], t:type };
  var row_map  = {};
  var updating = false;
  var ro       = 1;
  var sername  = thiz.attr('update_service') || 'sche_state';
  var up_but   = $('.update_job_list');

  _update();
  var uptid = setInterval(_update, UPDATE_TIME);
  up_but.click(_update);

  thiz.data('run-state', {
    update: _update,
  });


  function _update() {
    if (updating) return;
    updating = true;

    rotate.begin();
    refind_row();

    eeb.callService(sername, parm, function(data) {
      for (var _rid in data) {
        for (var attr in data[_rid]) {
          _set_val(_rid, attr);
        }
      }
      updating = false;
      rotate.stop();

      function _set_val(_rid, _attr_name) {
        // 如果 row_map[_rid] 应该仔细检查服务端代码
        row_map[_rid].find('td[val="' + _attr_name + '"]')
                     .html( data[_rid][_attr_name] );
      }
    }, function(dat) {
      console.log(sername, dat);
      offline();
      rotate.stop();
      return true;
    });
  }

  function offline() {
    //
    // 离线时, 不改变状态的列名称
    //
    var NO_CHANGE_TD = { NAME:1, ID:1, GID:1, GNAME:1, RNAME:1, VNAME:1 };
    clearInterval(uptid);
    up_but.off('click', _update);

    for (var r in row_map) {
      var tds = row_map[r].find('td');

      tds.each(function() {
        if (!NO_CHANGE_TD[ this.getAttribute('val') ]) {
          this.innerHTML = '<p class="offline">离线</p>';
        }
      });

      $('.offline_disabled').find(':input').prop('disabled', true);
      $('.offline_disabled').prop('disabled', true);
    }
  }

  function refind_row() {
    parm.rid = [];
    row_map = {};

    thiz.find('tr[role=row]').each(function() {
      var row = $(this);
      var rid = row.find('td[val=rid]').html();
      if (!rid) {
        rid = row.find('.key').html();
        if (!rid) throw new Error('cannot find key for row');
      }
      row_map[rid] = row;
      parm.rid.push(rid);
    });
  }
}


$('#edit-etl').click(function() {
  getSelectRid(function(rid, name) {
    open_edit_page(rid);
  });
});


$('#rename-etl').click(function() {
  getSelectRid(function(rid, name, jdom) {
    var clusterid = jdom.parent().find('*[val=GID]').html();

    inputName(name, function(newname, _close, newclusterid) {
      var parm = { id:rid, gid: newclusterid, name: newname };

      eeb.callService('rename2', parm, function() {
        var parm = {name: newname, rid: rid, t: type, cid: newclusterid};

        eeb.callService('rename', parm, function(data) {
          //_close();
          location.reload();
        });
      });
    }, clusterid);
  });
});


$('#del-etl').click(function() {
  getSelectRid(function(rid) {
    eeb.callService('delrc', {rid:rid, t:type}, function() {
      location.reload();
    });
  });
});


$('#create-etl').click(function() {
  eeb.callService('newrc', {t:type}, function(data) {

    inputName(data.name, function(newname, _close) {
      data.name = newname;
      eeb.postService('saverc', data, function(d) {
        open_edit_page(data.rid);
      });
    });

  });
});


$('#sche-etl').click(function() {
  getSelectRid(jump_to, null, jump_to);

  function jump_to(rid, name) {
    var wnid = eeb.get_wnid(true);
    var url = 'list-sche.htm?wnid=' + (wnid || '')
            + (rid ? '&rid=' + rid : '')
            + '&id=' + (eeb.parse_url_parm().query.id || '');
    window.open(url, '_self');
    return 'not-msg';
  }
});


//
// 打开一个任务编辑对话框
// sett     -- 初始化任务使用的数据对象
// api      -- 完成编辑调用的接口
// _success -- [可选] 接口调用成功的回调函数
//
function open_sche_edit(sett, api, _success) {
  var sche_editor = schedule_edit(sett.scheduleid, false, _loader, _saver, null);

  function _loader(rcb) {
    rcb(sett);
  }

  function _saver(_data, rcb) {
    $.extend(sett, _data);
    sett.__type = type;
    eeb.postService(api, sett, function(d) {
      eeb.show_msg_box(null, '成功');
      rcb();
      _success && _success();
    });
  }
}


$('#sche-create').click(function() {
  var newobj = { schedulenm: '' };
  open_sche_edit(newobj, 'schecreate', function() {
    $('.job_list').data('table-data-source').update(function() {
      $('.job_list').data('run-state').update();
    });
  });
});


$('#sche-edit').click(function() {
  getSelectRid(function(sid, _, jdom) {
    eeb.callService('scheget', { id:sid }, function(data) {
      try {
        data = JSON.parse(data);
      } catch(err) {
        console.log('sche-edit', err);
        data = {};
      }
      data.scheduleid = sid;
      open_sche_edit(data, 'scheedit', function() {
        $('.job_list').data('table-data-source').update(function() {
          $('.job_list').data('run-state').update();
        });
      });
    });
  });
});


$('#sche-del').click(function() {
  getSelectRid(function(sid, _, jdom) {
    eeb.callService('schedel', {id:sid, t:type}, function(data) {
      var msg = "任务成功删除, " + jdom.parent().find("td[val='NAME']").html();
      eeb.show_msg_box(null, msg);
      jdom.parent().remove();
    });
  });
});


$('#sche-start').click(function() {
  getSelectRid(function(sid, _, jdom) {
    eeb.callService('sche_start', { id:sid, t:type }, function(data) {
      var msg = data || '任务已启动';
      eeb.show_msg_box(null, msg);
      jdom.parent().find("td[val='run_state']").html(msg);
    });
  });
});


$('#sche-stop').click(function() {
  getSelectRid(function(sid, n, jdom) {
    eeb.callService('sche_stop', { id:sid, t:type }, function(data) {
      var msg = data || '任务已停止';
      eeb.show_msg_box(null, msg);
      jdom.parent().find("td[val='run_state']").html(msg);
    });
  });
});


$('#get-his').click(function() {
  getSelectRid(function(rid) {
    eeb.callService('sche_info', {rid: rid, t: type}, function(his) {
      if (his && his.length > 0) {
        var head = ['时间', '事件', '消息'];
        var map  = ['start_time', 'log', 'error'];
        var html = eeb.createTableHtml(head, his, map);

        var opt = { title: '计划任务历史记录', width: '88%' };
        eeb.easy_dialog(html, null, opt);
      } else {
        eeb.show_msg_box(null, "没有任务运行历史记录");
      }
    });
  });
});


$('#get-his2').click(function() {
  getSelectRid(function(rid) {
    eeb.callService('his', {rid:rid, t:type, up:Date.now()}, function(data) {
      var head = ['时间', '事件', '目标', 'Target ID'];
      var map  = ['time', 'msg', 'tname', 'tid'];
      var html = eeb.createTableHtml(head, data, map);

      var opt = { title: '历史记录', width: '88%' };
      eeb.easy_dialog(createTargetTable(data.content), null, opt);
    });
  });
});


//
// 如果列有 class='lhis_key', 则优先使用作为主键进行查询
//
$('#lhis').click(function() {
  getSelectRid(function(rid, _, jdom) {
    var _rid = jdom.parent().find(".lhis_key").html();
    eeb.load_file('lhis.htm', function() {
      eeb.openhis(_rid || rid);
    });
  });
});


$('#file-pool').click(function() {
  eeb.load_file('file-pool.htm', function() {
    eeb.open_file_pool();
  });
});


// $('.instance_id').each(function() {
//   var jdom = $(this);
//   eeb.callService('getiid', { t:type }, function(data) {
//     jdom.html('实例ID:&nbsp;' + data);
//   });
// });


$('#rc_start').click(function() {
  getSelectRid(function(rid, _, jdom) {
    eeb.callService('run', {t:type, rid:rid}, function(ret) {
      eeb.show_msg_box(null, ret);
      jdom.parent().find("td[val='run_state']").html(ret);
    });
  });
});


$('#rc_stop').click(function() {
  getSelectRid(function(rid, _, jdom) {
    eeb.callService('stop', {rid:rid}, function(ret) {
      eeb.show_msg_box(null, ret);
      jdom.parent().find("td[val='run_state']").html(ret);
    });
  });
});


$('#create-group').click(function() {
  var sel = create_work_node_select2();

  inputName('未命名', function(retname, closefn) {
    eeb.callService('grp_new', {n: retname, w: sel.wid.val()}, function(ret) {
      eeb.show_msg_box(null, ret);
      location.reload();
    }, create_err_handle(closefn, { 'Unique': '错误: 不能重名' }) );
  });
});


$('#edit-group').click(function() {
  getSelectRid(function(rid, _, jdom) {
    var table = jdom.parent();
    var def   = table.find('*[val=WID]').html()
    var name  = table.find("td[val=NAME]").html();
    var sel   = create_work_node_select2(def);


    inputName(name, function(retname, closefn) {
      eeb.callService('grp_mod', {n: retname, i:rid, w:sel.wid.val()}, function(ret) {
        eeb.show_msg_box(null, ret);
        location.reload();
      }, create_err_handle(closefn, { 'Unique': '错误: 不能重名' }) );
    });
  }, '请选择一个分组');
});


$('#del-group').click(function() {
  getSelectRid(function(rid) {
    eeb.callService('grp_del', {i:rid}, function(ret) {
      eeb.show_msg_box(null, ret);
      location.reload();
    });
  }, '请选择一个分组');
});


function create_work_node_select2(_def_val) {
  var form     = $('#input_name>form');
  var workname = form.find('[name=worknode]');
  var sel      = [];
  var ret      = { wid : workname };

  workname.select2({ width: '100%', data: sel });

  eeb.callService('nodelist', {pn:-1}, function(d) {
    d.forEach(function(r) {
      sel.push({
        id   : r.ID,
        text : r.HOST + ' / ' + r.IP,
      });
    });
    workname.select2('val', _def_val);
  });

  return ret;
}


function create_err_handle(next, msg) {
  return function(err) {
    if (err) {
      for (var n in msg) {
        if (err.msg.indexOf(n) >= 0) {
          eeb.show_msg_box(null, msg[n]);
          return true;
        }
      }
      return;
    }
    next && next();
  }
}


$('.auto_width_container').each(function() {
  var win  = $(window);
  var tab  = $(this);
  var left = $('.left');
  var pag  = $('.pagination');

  win.resize(function() {
    tab.height(win.height() - 240 - pag.height());
    tab.width(win.width() - left.width() - 50);
  });
  win.trigger('resize');
});


$('#rc-out').click(function() {
  getSelectRid(function(rid, name) {
    eeb.callService('getrc2', { rid:rid, t:type, wnid:1 }, function(ret) {
      //
      // 从接口获取配置文件, 在本地进行下载
      //
      var filename = name + '-' + rid + '.eeb';
      var str  = JSON.stringify(JSON.parse(ret), 2, 2);
      var data = new Blob([ str ], {type: "application/octet-binary"});
      var url  = URL.createObjectURL(data, {oneTimeOnly: true});
      var a    = $('<a class="mhide"></a>');
      a.attr({ href: url, download: filename });
      a[0].click();
      // $(document.body).append('<iframe src="' + url + '" class="mhide"/>');
    });
  });
});


$('#rc-in').click(function() {
  var thiz = $(this);
  var jfile = thiz.data('file-up-input');

  if (jfile) {
    jfile.trigger('click');
  } else {
    var jd = $("<p class='mhide'><input type='file' "
           + " class='btn btn-primary' value='删除'/></p>");

    jfile = jd.find('input');
    $(document.body).append(jd);
    thiz.data('file-up-input', jfile);

    jfile.change(upfile);
    jfile.trigger('click');
  }


  function upfile() {
    //
    // 读取本地文件, 利用接口上传
    //
    var reader = new FileReader();
    reader.readAsText(this.files[0]);
    jfile.val('');

    reader.onload = function() {
      var rc;
      try {
        rc = JSON.parse(this.result);
        if (typeof rc == 'string') rc = JSON.parse(rc);

        if (rc.name && rc.rid && rc.className && rc.targets) {
          if (rc.className != type)
            throw new Error('配置类型与当前系统不符, 切换到正确的系统后重试' +
              ' (不能在 ETL 中导入 ESB 配置, 或相反)');

          eeb.postService('importrc', rc, function(r) {
            eeb.show_msg_box(null, r + ', 导入配置: ' + rc.name);
          });
        } else {
          throw new Error('格式错误');
        }
      } catch(err) {
        console.log(err, rc);
        eeb.show_msg_box(null, "错误: 无效的配置文件, " + err.message);
      }
    };
  }
});


$('#conf-node-etl').click(function() {
  getSelectRid(function(wnid, _, jrow) {
    var id = jrow.parent().find('*[val=ID]').html();
    // var page = 'list-etl.htm'; // 作业配置
    var page = 'list-sche.htm'; // 任务配置
    if (wnid) id = '';
    open_url(page + '?id=' + id + '&wnid=' + wnid);
  });
});


$('#conf-node-esb').click(function() {
  getSelectRid(function(wnid, _, jrow) {
    var id = jrow.parent().find('*[val=ID]').html();
    // if (!wnid) {
    //   eeb.show_msg_box(null, '错误: 节点离线, 不能编辑');
    //   return;
    // }
    open_url('list-esb.htm?wnid=' + wnid + '&id=' + id);
  });
});


function create_v_edit_dialog(defrid) {
  var form     = $('#input_name>form');
  var ridsel   = form.find('[name=rid]');
  var wnid     = form.find("[name=wnid]").val();
  var wid      = form.find("[name=wid]").val();
  var ret      = { wid: wid, wnid: wnid, rid: ridsel };

  ridsel.select2({ width: '100%' });

  eeb.callService('joblist', { t: 1, wnid:wnid, all:1 }, function(dat) {
    var opts = eeb.createOptions();
    dat.forEach(function(d) {
      opts.push(d.ID, d.NAME);
    });
    opts.setto(ridsel);
    ridsel.val(defrid);
    ridsel.select2({width: '100%'});
  });

  return ret;
}


$('#create-varnish').click(function() {
  var sel = create_v_edit_dialog();

  inputName('未命名', function(retname, closefn) {
    var parm = { name: retname, wid: sel.wid, rid: sel.rid.val(), wnid: sel.wnid };

    eeb.callService('varnish_new', parm, function(ret) {
      eeb.show_msg_box(null, ret);
      closefn();
      $('.form_content').find(':submit').trigger('click');
    }, create_err_handle(closefn, { 'Duplicate': '错误: 不能重名' }) );
  });
});


$('#edit-varnish').click(function() {
  getSelectRid(function(vid, _, jrow) {
    var _name = jrow.parent().find('[val=NAME]').html();
    var _rid  = jrow.parent().find('[val=RID]').html();
    var sel = create_v_edit_dialog(_rid);

    inputName(_name, function(retname, closefn) {
      var parm = { name: retname, rid: sel.rid.val(), vid: vid };
      eeb.callService('varnish_mod', parm, function(ret) {
        eeb.show_msg_box(null, ret);
        closefn();
        $('.form_content').find(':submit').trigger('click');
      }, create_err_handle(closefn, { 'Duplicate': '错误: 不能重名' }) );
    });
  });
});


$('#del-varnish').click(function() {
  getSelectRid(function(vid, _, jrow) {
    eeb.callService('varnish_del', { vid: vid }, function(ret) {
      eeb.show_msg_box(null, ret);
      $('.form_content').find(':submit').trigger('click');
    });
  });
});


$('#design-varnish').click(function() {
  getSelectRid(function(vid, _, jrow) {
    var _rid = jrow.parent().find('[val=RID]').html();
    var url  = 'edit-varnish.htm?&t=1&vid=' + vid + '&wnid=' + eeb.get_wnid()
             + '&rp=list-varnish.htm&rid=' + _rid;
    open_url(url);
  });
});


$('#return-work').click(function() {
  open_url('list-sche.htm?' + eeb.parse_url_parm().search);
});


function open_edit_page(_rid) {
  var title = null, retpage = null;

  switch(type) {
    default:
    case 1:
      title = 'ETL 功能列表';
      retpage = 'list-etl.htm';
      break;
    case 2:
      title = 'ESB 功能列表';
      retpage = 'list-esb.htm';
      break;
    case 4:
      title = 'BPM 功能列表';
      retpage = 'list-bpm.htm';
      break;
  }

  open_url('edit-flow.htm?rid=' + _rid
          + "&t=" + type + "&title=" + title
          + "&rp=" + retpage
          + "&wnid=" + eeb.get_wnid() );
}


function open_url(_url) {
  window.open(_url, '_self');
}


//
// 返回当前选择行中 .select_job_id 选择器的 html
// (select_job_id 这个名字起的很糟糕, select_row_id 更合适)
// rcb: Function(rid, name)
//
function getSelectRid(rcb, def_msg, not_find) {
  if (!rcb) throw new Error("参数不能空");

  var length = 0;

  $('.select_job_id').each(function() {
    var thiz = $(this);
    if (!thiz.hasClass('selected_row')) {
      return;
    }

    ++length;
    var rid = thiz.html();
    var name = thiz.parent().find("td[val=NAME]").html();
    rcb(rid, name, thiz);
  });

  if (length < 1) {
    var datatag = $('transfer_data#__page_typename').html();
    var typename = def_msg
                || datatag && ('请选择一个' + datatag)
                || '请选择一个任务';
    if (not_find) {
      if (not_find() === 'not-msg') return;
    }
    eeb.show_msg_box(null, typename);
  }
}


function inputName(initname, when_name, initcluster) {
  var dl  = $('#input_name');
  var inp = dl.find(":input[name=jobname]");
  var msg = dl.find('.message');

  if (inp.length < 1) inp = dl.find(":input[name=name]");
  inp.val(initname);

  dl.dialog({
    modal: true,
    width: '400px',
    buttons: {
      "确认": ok,
      "取消": function() {
        dl.dialog("close");
      },
    }
  });
  eeb.fix_dialog_ui(dl);

  function ok() {
    msg.html('');
    var retname = inp.val();

    if (retname == '') {
      msg.html("名称不能为空");
      return;
    }

    when_name && when_name(retname, function() {
      dl.dialog("close");
    }, null, dl);
  }
}

});
