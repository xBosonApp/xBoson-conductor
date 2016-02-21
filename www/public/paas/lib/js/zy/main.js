/**
 * Index负责处理权限、菜单等视图的显示及操作
 * @class Index
 */
Index = (function() {

  var PT = Index.prototype;
  var instance;

  /**
   * 默认配置参数
   * @attribute g_init
   * @private
   */
  PT.g_init = {
    user : 'aa',
    admin : 'aa'
  }

  /**
   * 事件绑定规则定义
   * @property Events
   */
  PT.Events = {};

  /**
   * @class Index
   * @constructor
   */
  function Index() {
    instance = this;
    instance.initMenu();
    return this;
  }

  /**
   * 菜单初始化
   * @method initMenu
   */
  PT.initMenu = function() {
    var error = function(msg) {
      //dialog.errorMsg(d, msg.msg, ".advice");
      zy.log("Index.initMenu.error = " + msg.ret + " : " + msg.msg);
    };
    var callback = function(msg) {
      if (msg) {
        instance.menuView(msg.apps, $("#zy_menu"));
      }
    };
//    _g.app = "zyapp_menu";
//    _g.mod = "zymodule_menu";
    Api.ajax.get("api/apps", callback, null, error);
  }
  /**
   * 菜单视图加载
   * @method menuView
   * @param {String} _list 为json数据
   * @param {Boolean} parent 为父节点对象
   */
  PT.menuView = function(_list, parent) {
    for (var i in _list) {
      //如果有子节点，则遍历该子节点
      if ($(_list[i].children).length > 0) {
        var li = $("<li></li>");
        $(li).append("<a href=\"" + _list[i].uri + "\" class=\"dropdown-toggle\"><i class=\"fa fa-leaf fa-lg\"></i><span class=\"menu-text\">" + _list[i].appnm + "</span><span class=\"badge badge-primary\">" + $(_list[i].children).length + "</span><b class=\"arrow fa fa-angle-down\"></b></a>");
        var ul = $("<ul class=\"submenu\"></ul>");
        //给li节点添加ul子节点，并将这个li节点添加到父亲节点中
        $(li).append($(ul)).appendTo(parent);
        //将ul作为下一个递归遍历的父亲节点传入
        instance.menuView(_list[i].children, $(ul));
      } else {
        if ( typeof (_list[i].moduleid) != "undefined") {
          //为module节点
          parent.append("<li><a href=\"" + _list[i].moduleid + "\"><i class=\"fa fa-angle-double-right\"></i>" + _list[i].modulenm + "</a></li>");
        } else {
          var uri = _list[i].uri;
          var icon = "fa fa-leaf fa-lg";
          if (_list[i].appflag == '1') {
            uri = "iframe.html?uri=" + uri;
            icon = "fa fa-tag fa-lg";
            //第三方应用
          }
          parent.append("<li><a href=\"" + uri + "\"><i class=\"" + icon + "\"></i><span class=\"menu-text\">" + _list[i].appnm + "</span></a></li>");
        }
      }
    }
  }
  return Index;
})();

// Menu事件绑定
$("#zy_menu").i_coffee({
  click : {
    //这是是支持jQuery的':last / [attr] / :eq(0)'等方法的
    'a' : function() {
      //alert("标签a点击事件");
      //$(this).addClass("selected");
      //$(this).removeClass("open");
    }
  },
  mouseover : {
    'i' : function() {
      this.style.cursor = 'pointer';
    },
    'b' : function() {
      this.style.cursor = 'pointer';
    }
  }
});
