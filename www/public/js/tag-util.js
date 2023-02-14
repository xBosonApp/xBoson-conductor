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
$(document).ready(function() {

//----------------------------------------------------------------
//
// 一些标签的特殊语法, 实现不用 js 就能完成一些功能
// 同时这些方法也导出到 eeb 空间供编程使用
//
//----------------------------------------------------------------
eeb.table_select_row = table_select_row;
eeb.table_data_source = table_data_source;


$("table[url]").each(function() {
  eeb.table_data_source($(this));
});

$('.main_frame').scroll(function() {
  $(this).scrollTop(0);
  console.log('window scroll move');
});

button_href();
table_select_row();


// 
// 如果按钮有 href 属性, 则点击后行为和 <a/> 相同
//
function button_href() {
  $('input[href]').click(function() {
    window.open(this.getAttribute('href'), '_self');
  });
}

//
// 如果表格有 chose_row 属性
// 允许单选行, 被选行的 tr.class 加上 active 属性
// 如果使用函数调用, 返回一个函数用于取得当前选择行
// getSelectRow: Functin(rcb) : rcb: Function(jrow)
//
function table_select_row(_table) {
  if (!_table) {
    $('table[chose_row]').each(function() {
      do_table(this);
    });
  } else {
    return do_table(_table);
  }

  function do_table(table) {
    var select = null;
    var tr_s = $(table).find('tbody').find("tr");

    //
    // 离线字样的行设置 offline class
    //
    tr_s.each(function() {
      var tr = $(this);

      tr.find('td').each(function() {
        var td = $(this);
        if (td.html().indexOf('离线') >= 0) {
          tr.addClass('offline');
        }
      });
    });

    tr_s.click(function() {
      var tr = $(this);
      if (select) {
        if (select == tr) return;
        select.removeClass('active').find('td').removeClass('selected_row');
      }
      
      tr.addClass('active').find('td').addClass('selected_row');
      select = tr;
    });

    return {
      getSelectRow : getSelectRow
    };


    function getSelectRow(rcb) {
      rcb(select);
    }
  }
}

//
// 如果表格有 url 属性, 则从数据源中读取数据并绑定到表格上
// thead > th 的 val 属性决定绑定的数据属性
// 返回的 json 必须是一个数组
// 创建出的 td 会复制 th 的 class 属性
// 返回的数据 ext.pagination 则产生分页组件
// pagination: { total - 总行数, curr - 从 0 开始当前页码, size - 单页行数 }
// table 如果使用 form 包含, 则 form 在递交时会搜索所有表单作为查询条件
// 在查询数据时递交, 这些条件以 json 字符串放在 where 参数中
//
// _overcb -- 当组件第一次请求完成时触发
// _form_update_rcb -- 以表单递交完成后触发, 翻页时也会触发
// _fail_rcb -- 如果出错, 这个方法被触发
// .data('table-data-source') 可以返回一个对象, 用于执行内部方法
//
// ... 这段注释好乱 ... 
//
function table_data_source(jdom, _overcb, _form_update_rcb, _fail_rcb) {
  jdom.each(_get_source);

  function _get_source() {
    var table     = $(this);
    var col       = [];
    var className = [];
    var url       = table.attr('url');
    var jpagediv  = $('<div></div>');

    table.find('thead th').each(function(i) {
      col[i] = $(this).attr('val');
      className[i] = this.className;
    });

    table.parent().append(jpagediv);

    open_url(url, null, function() {
      table.parents('form').submit(function() {
        // console.log(this)
        _update(_form_update_rcb);
        return false;
      });
      _overcb && _overcb(ret());
    });

    table.data('table-data-source', ret());

    //
    // 返回的对象
    //
    function ret() {
      return {
        update : _update,
      }
    }

    function _update(_ov) {
       open_url(url, null, _ov);
    }

    function open_url(_url, _not_page, _next) {
      var parm = eeb.getParentFormParm(table);
      if (parm) parm = JSON.stringify(parm);
  
      $.getJSON(_url, { where: parm }, function(data) {
        if (data.ret != 0) {
          if (_fail_rcb) {
            _fail_rcb(data);
          } else {
            console.log('table_data_source get err:', data);
            eeb.show_msg_box(null, data.msg);
          }
          return;
        }

        var ext = data.ext;
        var domstr = [];
        var _ = function(s) { domstr.push(s); return _; };

        data.data.forEach(function(rdata, row) {
          _('<tr role="row" class="')(row % 2 == 0 ? 'even' : 'odd')('">');

          for (var i=0; i<col.length; ++i) {
            _('<td class="')(className[i])('" val="')(col[i])('">');
            if (col[i]) {
              try {
                var v = eval('rdata.' + col[i]);
                v && _(v);
              } catch(e) {
                _(e.message);
              }
            }
            _('</td>');
          }

          _('</tr>');
        });
        
        table.find('tbody').html( domstr.join('') );
        // table.append(domstr.join(''));
        table_select_row(table);

        if (ext && ext.pagination) {
          create_page(ext.pagination);
        }
        _next && _next();
      });
    }

    function create_page(pg) {
      eeb.pagination(jpagediv, pg.total / pg.size, pg.curr+1, sw_page);

      function sw_page(pagec) {
        table.find("tbody").html('');
        var sp = url.indexOf('?') >=0 ? '&' : '?';
        open_url(url + sp + 'pn=' + (pagec-1), null, _form_update_rcb);
      }
    }

  } // _get_source
}

});