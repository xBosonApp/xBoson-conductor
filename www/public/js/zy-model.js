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

var eeb = window.eeb;

eeb.get_zy_conn_detail          = get_zy_conn_detail;
eeb.get_zy_conn_list            = get_zy_conn_list;
eeb.get_zy_model_sql            = get_zy_model_sql;
eeb.get_zy_model_list           = get_zy_model_list;
eeb.parse_sql                   = parse_sql;
eeb.build_select_sql_bind_parm  = build_select_sql_bind_parm;


var db_type_mapping = {
  '01': 'mysql',
  '02': 'sqlserver',
  '03': 'oracle',
  '04': 'db2'
};


function parse_sql(sql) {
  var select = /select (.*) from (?:(?:(.*)(?: where)(?:.*))|(.*))/;
  var insert = /insert into (.*?)\((.*?)\)/;
  var update = /update (.*) set (?:.*)/;
  var result = {};

  sql = sql.toLowerCase();
  console.log(sql);

  var ret = select.exec(sql);
  if (ret) {
    result.table = ret[2] || ret[3];
    result.fields = ret[1].split(',');
    return result; 
  }

  ret = insert.exec(sql);
  if (ret) {
    result.table = ret[1];
    result.fields = ret[2].split(',');
    return result; 
  }

  ret = update.exec(sql);
  if (ret) {
    result.table = ret[1];
    result.fields = null;
    return result; 
  }

  return result;
}


//
// 返回的 sql 做参数绑定, target_conf.sparm 必须是对象
// jsql_input -- sql 表单对象
// jparm_root -- 在这个 dom 中生成参数列表表单
// sql        -- 含有待绑定参数的 sql
// parm       -- 参数
// _data_arr  -- [可选] 此时parm为空
// _not_clear -- [可选] 不清空 jparm_root
// _not_bind  -- [可选] 不绑定数据变更, 如果是函数则回调
//
function build_select_sql_bind_parm(parent_bind, target_conf, 
      jsql_input, jparm_root, sql, parm, _data_arr, _not_clear, _not_bind) {

  var parm_map = {};
  var data = parm ? parm.search : _data_arr;
  var i = -1;

  if (!_not_clear) {
    jparm_root.empty();

    if (data.length <= 0) {
      jparm_root.append("<label>[无参数]</label>");
    }
  } 

  loop();


  function loop() {
    if (++i < data.length) {
      var p = data[i];
      var unit = p.unit && ('<span class="txt-color-blueLight pull-right">[ 单位: ' 
               + p.unit + ' ]</span>');

      if (p.dict) {
        eeb.get_zy_dict(p.dict, create_input);
      } else {
        create_input('<input/>');
      }

      function create_input(html) {
        var inp = $(html);
        inp.attr('name', 'sparm.' + p.en);
        inp.attr('label', p.cn + (unit || ''));
        inp.attr('col', 6);
        inp.addClass('bind_parm');
        inp.data({ p:p, i:i });

        jparm_root.append(inp);
        parm_map[p.en] = inp;
        loop();
      }

    } else {
      eeb.auto_form_ui(jparm_root);

      if (!_not_bind) {
        var sub_bind = eeb.create_bind(target_conf, jparm_root, change_sql);
        parent_bind.addSub(sub_bind);
      } else if (typeof _not_bind == 'function') {
        _not_bind(jparm_root);
      }
    }
  }


  function change_sql() {
    var _ch_sql = sql;

    for (var en in parm_map) {
      var reg = RegExp('{' + en + '}', 'gm');
      var val = "'" + parm_map[en].val() + "'";
      _ch_sql = _ch_sql.replace(reg, val);
    }

    jsql_input.val(_ch_sql).trigger('change');
  }
}


//
// 生成下拉列表 select 的 html 代码
// html_getter : Function(select-html)
//
function get_zy_dict(dictid, html_getter) {
  eeb.callZyapi({
    api     : 'getdict',
    mod     : 'ZYMODULE_LOGIN',
    app     : 'ZYAPP_LOGIN',
    typecd  : dictid,
    orgid   : eeb.getOrg()

  }, function(d) {
    var dictarr = d.result[0][dictid];
    var html = ["<select>"], _ = function(s) { html.push(s); return _; };

    dictarr.forEach(function(item) {
      _('<option value="')(item.id)('">');
      _(item.text);
      _('</option>');
    });
    _('</select>');

    html_getter(html.join(''));
  });
}


function get_zy_model_sql(jroot, modolcd, flag, sql_getter) {
  if (!modolcd) {
    console.log('需要选择模型');
    return;
  }

	eeb.callZyapi({
    api       : 'getbmsqltext',
    mod       : 'getmodelinfo',
    app       : 'c770045becc04c7583f626faacd3b456',
    flg       : flag || 'S',
    modolcd   : modolcd

  }, function(d) {
    // console.log('!!!', d);
    var _ret = d.result[0];

    // 页面要有 sql 字段的 input
    input_val(jroot, 'sql', _ret.sqltext);

    if (!sql_getter) return;

    var parm = JSON.parse(_ret.typecontent);
    sql_getter(_ret.sqltext, parm);
  });
}


function get_zy_model_list(jselect, did, flag, next) {
  if (!did) return;
  
	eeb.callZyapi({
    api : 'getbminfo',
    mod : 'getmodelinfo',
    app : 'c770045becc04c7583f626faacd3b456',
    flg : flag || 'S',
    did : did

  }, function(d) {
    jselect.append('<option value="">[未选择]</option>');

    if (d.result) {
      d.result.forEach(function(conn_index) {
        jselect.append('<option value="' + conn_index.id + 
            '" title="' + conn_index.text + '">' + conn_index.name + '</option>');
      });
    }

    next && next();
  });
}


function get_zy_conn_detail(jroot, did) {
  if (!did) return;

  eeb.callZyapi({
    did : did, 
    api : 'getdatasourceupt',
    mod : 'datasource',
    app : 'ZYAPP_SYSMGT'

  }, function(d) {
    var conn = d.result[0];

    // 页面要有 'conn.name' 字段的 input, 下同
    input_val(jroot, 'conn.name',      conn.dn);
    input_val(jroot, 'conn.host',      conn.dhost);
    input_val(jroot, 'conn.database',  conn.en);
    input_val(jroot, 'conn.user',      conn.user_name);
    input_val(jroot, 'conn.password',  conn.pass);
    input_val(jroot, 'conn.driver',    db_type_mapping[ conn.dbtype ]);

    if (conn.dport)
      input_val(jroot, 'conn.port', conn.dport);
  });
}


function get_zy_conn_list(jselect, next) {
  eeb.callZyapi({
    api: 'datasource',
    mod: 'tableandindex',
    app: 'c879dcc94d204d96a98a34e0b7d75676'

  }, function(d) {
    jselect.append('<option value="">[未选择]</option>');

    d.data.forEach(function(conn_index) {
      jselect.append('<option value="' + conn_index.id + 
          '" title="' + conn_index.text + '">' + conn_index.name + '</option>');
    });

    next && next();
  });
}


function input_val(root, iname, value) {
  root.find(':input[name="' + iname + '"]').val(value).trigger('change');
}


})();