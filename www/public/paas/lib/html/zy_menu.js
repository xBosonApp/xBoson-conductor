/**
 * UI
 * @class zyMenu
 *
 * 用法说明：
 *  var options = {width: '80%'};
 *  var m_ = new zyMenu(options,'#mdm_datadict_h1_form'); // 设置参数选项及父元素
 *  m_.Init(); // 生成菜单
 *  m_.Show('.dataTables_wrapper'); // 参数：模态窗口内容子元素
 */
zyMenu = (function() {

  var PT = zyMenu.prototype;
  var thiz;

  /**
   * @class zyMenu
   * @constructor
   * @param {String} el 容器元素对象
   */
  function zyMenu(el) {
    zy.log("new zyMenu(options, el)");
    thiz = this;
    thiz.el = el;
    return this;
  }

  /**
   * 初始化
   * @method init
   */
  PT.Init = function() {
    thiz.destroy();
    var callback = function(msg) {
      if (msg) {
        if (msg.result.length > 0) {
          PT.menuView(msg.result, $(thiz.el));
          // INITIALIZE LEFT NAV

          // 初始化自动加载首页
          checkURL();
          //切换机构时检测页面
          var url = location.hash.replace(/^#/, '');
          if (url) {
            if ($('nav a[href="' + url + '"]').length > 0) {
              $('nav a[href="' + url + '"]').parents('li.active').addClass('open');
            } else {
              var home = $('nav > ul > li:first-child > a');
              if (home.attr('href').indexOf('home') != -1) {
                window.location.hash = home.attr('href');
              } else {
                window.location.hash = "emptyhome.html";
              }
            }
          }
          $(thiz.el).jarvismenu({
            accordion : true,
            speed : $.menu_speed,
            closedSign : '<em class="fa fa-chevron-right"></em>',
            openedSign : '<em class="fa fa-chevron-down"></em>'
          });
        } else {
          window.location.hash = "emptyhome.html";
          zy.ui.msg('错误', '菜单项不存在', 'e');
        }
      }
    };

    zy.g.am.app = 'ZYAPP_LOGIN';
    zy.g.am.mod = 'ZYMODULE_LOGIN';
    zy.net.get("api/orgmenu", callback);
  };

  PT.destroy = function() {
    zy.log('menu  destroy');
    $(thiz.el).empty();
  };

  /**
   * 菜单视图加载
   * @method menuView
   * @param {String} _list 为json数据
   * @param {Boolean} parent 为父节点对象
   */
  PT.menuView = function(_list, parent) {

    var ul = $("<ul></ul>");
    _list = _list.sort(function(a, b) {
      return (Number(a.sorting_order) - Number(b.sorting_order));
    });
    for (var i in _list) {
      var icon = _list[i].menu_icon;
      if (icon)
        icon = '<i class=\"fa fa-lg fa-fw ' + icon + '\"></i>';
      //如果有子节点，则遍历该子节点
      var children = _list[i].children;
      if ($(children).length > 0) {
        var li = $("<li></li>");
        li.append('<a href=\"#\">' + icon + '<span class=\"menu-item-parent\">' + _list[i].menunm + '</span></a>');

        //将ul作为下一个递归遍历的父亲节点传入
        PT.menuView(children, li);
        //将这个li节点添加到父亲节点中
        ul.append(li);
      } else {
        
        var uri = _list[i].uri || '';
        // 第三方应用
        if (_list[i].appflag == '1') {
          ul.append('<li><a href=# onclick=JavaScript:add_iframe(this) uri=' + uri.replace(/(\/$)/g, "") + '>' + icon + '<span class=\"menu-item-parent\">' + _list[i].menunm + '</span></a></li>');
        } else {
          var p = /^paas\/emptymain.html#/;
          if(p.test(uri)){
            var href = uri.replace(p,'');
            var path = uri.match(/^paas/);
          } else{
            var t = uri.split('/');
            var path = t[0] + '/' +t[1];
            var tt = [];
            for(ii in t){
              if(ii > 1)
                tt.push(t[ii]);
            }
            var href = tt.join('/');
          }
          ul.append('<li><a href=' + href + ' path='+ path + '>' + icon + '<span class=\"menu-item-parent\">' + _list[i].menunm + '</span></a></li>');
        }
      }
      ul.appendTo(parent);
    }
  };

  return zyMenu;
})();