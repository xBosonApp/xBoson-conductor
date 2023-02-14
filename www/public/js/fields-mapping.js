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
// 依赖 dom.jsPlumb-1.7.4-min.js


eeb.createFieldsMapping = createFieldsMapping;
eeb.build_tables_html   = build_tables_html;


//
// 创建选择表格对话框
// _jparnet  -- 父对话框的 dom 或者这个 dom 的父容器是父对话框
// data      -- {meta:Array, data:Array}
// select_cb -- Function(table_name:String)
//
function build_tables_html(_jparnet, data, select_cb) {
  var fd     = data.meta[0].field;
  var row    = data.data;
  var tables = [];

  for (var i = 0; i < row.length; ++i) {
    var txt = row[i][fd];
    var len = txt.length > 20 ? ( txt.length > 40 ? 12 : 6) : 3;
    tables.push('<section class="col col-md-');
    tables.push(len);
    tables.push('"><label class="input">');
    tables.push('<a>');
    tables.push( txt );
    tables.push('</a></label></section>')
  }

  var opt = { width: '88%', title: '选择一个表' };
  var dialog = eeb.easy_dialog(tables.join(''), _jparnet, opt);

  dialog.find('a').click(function() {
    var tname = $(this).html();
    select_cb(tname);
    dialog.dialog('close');
  });
}


//
// 创建一个表字段关联图形
// rc    -- 目标配置
// jroot -- 在这个 dom 中绘制图形
// mapping_attr_name -- 从 rc 中取得映射的属性名, 默认 'mapping'
//
// return Object { clearAndSetFields -- 初始化字段 }
//
function createFieldsMapping(rc, jroot, eeb_work, mapping_attr_name) {

  var prefix  = mapping_attr_name || 'mapping';
  var mapping = rc[ prefix ];
  var plumb   = create_plumb_instance();

  var ret = {
    clearAndSetFields : clearAndSetFields
  };


  var html = '<section class="col col-md-12">' +
      '<label class="label">' +
      '  <span>目标表字段</span>' +
      '  <span class="col col-md-6">映射-源表字段</span>' +
      '</label>' +
      '<label class="label">' +
      '  <div size="7" style="height:auto; overflow: visible; padding:9px" ' +
      '    placeholder="" class="src_fields well">' +
      '  </div>' +
      '</label>' +
    '</section>';

  jroot.html(html);

  var src_fields = jroot.find('.src_fields');


  //
  // 初始化映射图
  // fields: Array [ {field:String, typename:String, display:String||NULL} ]
  //
  function clearAndSetFields(fields) {
    var items = src_fields;
    items.html('').height(30);
    clear_all_endpoint();

    makeTableFields(fields, function() {
      makeSourceFields(function() {
        dropdrag(items);
      });
    });
  }


  // 创建目标表字段
  function makeTableFields(fields, next) {
    var div = src_fields;
    var y = 5;

    fields.forEach(function(fd, i) {
      div.append(fieldNameTemplate(true, fd.field, fd.typename, y, fd.display));
      y += 20;
    });
    changeHeight(div, y);
    next && next();
  }


  // 创建源表字段
  function makeSourceFields(next) {
    var div = src_fields;
    var x = jroot.width() / 2, y = 5;

    eeb_work.parent_data(function(err, data) {
      if (!err) {
        for (var i=0; i<data.head.length; ++i) {
          div.append(fieldNameTemplate(false, data.head[i], data.type[i], y));
          y += 20;
        }
        changeHeight(div, y);
        next && next();
      }
    });
  }


  function changeHeight(_parent, _heigh) {
    if (_parent.height() < _heigh) {
      _parent.height(_heigh);
    }
  }

  function fieldNameTemplate(isSource, field, typename, y, display) {
    var x = isSource ? jroot.width() / 2 -10 : 15;
    // var y = i * 20 + 5;

    if (isSource) {
      return '<div style="padding-left:15px; width:35%; position:absolute; left:' + 
             x + 'px; top:' + y + 'px" is="tag" id="tag_field_' +
             field + '_' + prefix + '" target_field="' + 
             field + '" prefix="' + prefix + '">' + 
             (display || field) + '<span class="note">&nbsp;&nbsp;&nbsp;' + 
             typename + '</span></div>';
    } else {
      return '<div is="src" style="width:35%; position:absolute; left:' + 
             x + 'px; top:' + y + 'px" id="src_field_' + 
             field + '_' + prefix + '" target_field="' + 
             field + '" prefix="' + prefix + '">' + 
             (display || field) + '&nbsp;&nbsp;&nbsp;<span class="note">' + 
             typename + '</span></div>';
    }
  }


  var color1 = "#316b31",
      color2 = "rgba(229,219,61,0.5)";

  // 拖拽连线使用的样式
  var endPointConf = {

    src: {
      //设置连接点的形状为圆形  
      endpoint        : ["Dot", { radius:7 }],  
      anchor          : "RightMiddle",
      //设置连接点的颜色  
      paintStyle      : { fillStyle:color1 },   
      //是否可以拖动（作为连线起点）  
      isSource        : true,
      //连接点的标识符，只有标识符相同的连接点才能连接  
      scope           : "green dot",
      //连线颜色、粗细  
      connectorStyle  : { strokeStyle:color1, lineWidth:2 },
      //设置连线为贝塞尔曲线  
      connector       : ["Bezier", { curviness:63 } ],
      //设置连接点最多可以连接几条线
      maxConnections  : 99,
      //是否可以放置（作为连线终点）
      isTarget        : true,  
      //设置放置相关的css  
      // dropOptions : exampleDropOptions
    },

    tag: {
      endpoint        : ["Rectangle", { width:11, height:11 }],   //设置连接点的形状为矩形  
      anchor          : "LeftMiddle",    
      paintStyle      : { fillStyle:color2, opacity:0.5 },
      isSource        : true,
      scope           : 'yellow dot',
      connectorStyle  : { strokeStyle:color2, lineWidth:2 },
      connector       : ["Bezier", { curviness:63 } ], //"Straight", 直线  
      isTarget        : true,
      maxConnections  : 1,
      // dropOptions     : exampleDropOptions,
    }
  };


  var __cached_end_points = { "tag": {}, "src":{} };


  function clear_all_endpoint() {
    for (var id in __cached_end_points.tag) {
      plumb.removeAllEndpoints( __cached_end_points.tag[ id ] );
    }
    for (var id in __cached_end_points.src) {
      plumb.removeAllEndpoints( __cached_end_points.src[ id ] );
    }

    plumb = create_plumb_instance();
    __cached_end_points = { "tag": {}, "src":{} };
  }


  // 拖拽连线
  function dropdrag(_parent) {

    var candd = _parent.find('*[target_field]');
    var cache = __cached_end_points;

    candd.each(function() {
      var thiz = $(this);
      var ep = plumb.addEndpoint(thiz.attr('id'), endPointConf[ thiz.attr('is') ]);
      cache[ thiz.attr('is') ][ thiz.attr('target_field') ] = ep;
    });

    candd.hover(
      function () { mouse_on(this, true); },
      function () { mouse_on(this); }
    );

    var change_struct = false;

    for (var t in mapping) {
      var s = mapping[t];

      if (cache.src[s] && cache.tag[t]) {
        plumb.connect({ target: cache.src[s], source: cache.tag[t] });
      } else {
        change_struct = true;
        delete mapping[t];
      }
    }

    if (change_struct) {
      eeb.show_msg(src_fields, '表结构已经改变, 不能创建完整映射', 10000);
    }
  }


  function mouse_on(thiz, yes) {
    var t   = $(thiz);
    var o   = $();
    var css = null;

    if (t.attr('is') == 'tag') {
      var src = mapping[ t.attr('target_field') ];
      o = src_fields.find('*[target_field=' + src + ']');
    }
    else if (t.attr('is') == 'src') {
      var src = t.attr('target_field');

      for (var tag in mapping) {
        if (src == mapping[tag]) {
          o = o.add( src_fields.find('*[target_field=' + tag + ']') );
        }
      }
    }

    if (yes) {
      css = {'border-bottom': '1px solid #999'};
    } else {
      css = {'border-bottom': '0px'};
    }

    t.css(css);
    o.css(css);
  }


  // 取得连线事件中的两个端点
  function getSrcAndTar(info) {
    var a = [ $('#' + info.sourceId), $('#' + info.targetId) ];
    var s, t, p;

    for (var i = 0; i<a.length; ++i) {
      if (!p) p = a[i].attr('prefix');
      else if (p != a[i].attr('prefix')) 
        return {};

      if (a[i].attr('prefix') != prefix)
        return 'skip';
      
      if (a[i].attr('is') == 'src') 
        s = a[i].attr('target_field');

      else if (a[i].attr('is') == 'tag') 
        t = a[i].attr('target_field');
    }

    return { s:s, t:t };
  }


  function create_plumb_instance() {
    var _plumb = jsPlumb.getInstance();

    // 建立连线事件
    _plumb.bind("beforeDrop", function(info) {
      var a = getSrcAndTar(info);
      if ('skip' == a) return true;

      var s = a.s, t = a.t;
      if (s && t) {
        if (mapping[t]) return false;
        mapping[t] = s;
        return true;
      }

      return false;
    });


    // 删除连线事件
    _plumb.bind("beforeDetach", function(info) {
      var a = getSrcAndTar(info);
      if ('skip' == a) return true;

      var s = a.s, t = a.t;
      if (s && t) {
        delete mapping[t];
      }
      return true;
    });

    return _plumb;
  }


  return ret;
} // [END] createFieldsMapping


})();