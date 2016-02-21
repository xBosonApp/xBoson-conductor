/**
 * UI
 * @class zyTabs
 *
 * 用法说明：
 *  var t_ = new zyTabs('#mdm_datadict_h1_wid'); // 设置参数选项及父元素
 *  t_.Add({id:'mdm_datadict_type',name:'数据字典类别管理',el:$('#mdm_datadict_h1')}); // 参数
 */
zyTabs = (function () {

  var PT = zyTabs.prototype;
  var thiz;

  /**
   * 默认参数
   * @attribute defaults
   * @private
   */
  PT.defaults = {
    id: 'zy_tabs',
    tabs: $('<div></div>'),
    tablist: $('<ul></ul>'),
    tab: '<li data-id="#{id}" style="position:relative"><a href="#{href}">#{label}&emsp;&emsp;&emsp;</a></li>',
    btn: '<span class="air air-top-right delete-tab" style="top:7px;right:7px"><button class="btn btn-xs font-xs btn-default hover-transparent"><i class="fa fa-times"></i></button></span></span>',
    tabpanel: '<div><p></p></div>'
  };

  /**
   * @class zyTabs
   * @constructor
   * @param {Object} el 容器元素对象
   * @param {Object} options 参数
   */
  function zyTabs(el, options) {
    zy.log("new zyTabs(el, options)");
    thiz = this;
    // 合并初始化参数选项
    thiz.opts = $.extend({}, thiz.defaults, options);
    thiz.el = el;
    thiz.Init();
    return this;
  }

  /**
   * 初始化
   * @method init
   */
  PT.Init = function () {
//  thiz.opts.index = 0;
    thiz.opts.tabs.attr("id",thiz.opts.id);
    thiz.opts.tabs.append(thiz.opts.tablist);
    $(thiz.el).append(thiz.opts.tabs);
    thiz.zytab = $('#' + thiz.opts.id);
    thiz.zytab.tabs();
    thiz.zytab.on("click", 'span.delete-tab', function() {
      var panelId = $(this).closest("li").remove().attr("aria-controls");
      $("#" + panelId).remove();
      thiz.zytab.tabs("refresh");
      var _num = $('#zy_tabs ul li').length;
      thiz.active(_num - 1);
    });
  };

  /**
   * Tab页是否已存在，存在为:true
   * @method isTab
   * @param {String} id:TabID
   * @return {Boolean}
   */
  PT.isTab = function (id) {
    if($('#'+id).length > 0)
      return true;
    return false;
//  var t = thiz.zytab.children("ul").children("[data-id='" + id + "']");
////  zy.log("zyTabs.isTab(" + id + ") = " + t.data('id'));
//  if (id == t.data('id')) {
//    zy.log("zyTabs.isTab(" + id + ") = " + t.html());
//    thiz.zytab.tabs("option", "active", t.attr("tabindex"));
//    return true;
//  } else {
//    return false;
//  }
  };
  /**
   * 添加Tab页
   * @method Add
   * @param {String} id:TabID
   * @param {String} name:Tab名
   * @param {Boolean} btn:true 关闭按钮
   * @param {Object} el:元素对象
   * @return {String} tabpanel 的 id
   */
  PT.AddTab = function (id, name, btn, el) {
    var tab_id = 'zy_tabs-' + id.replace(/[ ]/g,"").replace(/(\/)/g, "");
    if (thiz.isTab(tab_id))
      return String($('#' + tab_id).index() - 1);
    var tab = $(thiz.opts.tab.replace(/#\{id\}/g, id).replace(/#\{href\}/g, '#' + tab_id).replace(/#\{label\}/g, name));
    if (btn)
      tab.append($(thiz.opts.btn));
    thiz.opts.tablist.append(tab);
//  thiz.zytab.children("ul").append(tab);
//  $('#' + thiz.opts.id).find(".ui-tabs-nav").append(tab);
    var tabpanel = $(thiz.opts.tabpanel).attr('id',tab_id);
    if (el)
      tabpanel.children('p').html(el);
    tabpanel.hide();
    thiz.opts.tabs.append(tabpanel);
    thiz.zytab.tabs();
    thiz.zytab.tabs("refresh");
//    thiz.zytab.tabs("option", "active", thiz.opts.index);
    thiz.zytab.tabs("option", "active", tab.attr("tabindex"));

//  thiz.opts.index++;
    return null;
  };
  /**
   * 获取Tab打开数量
   * @method getCount
   * @return {Number} 打开的数量
   */
  PT.getCount = function () {
    zy.log("zyTabs.getCount = " + thiz.zytab.children("ul").children("li").length);
    return  thiz.zytab.children("ul").children("li").length;
  };
  /**
   * 激活Tab
   * @method active
   * @return {Number} 要激活的Tab索引
   */
  PT.active = function (index) {
    zy.log("zyTabs.active = " + index);
    thiz.zytab.tabs("option", "active", index);
  };
  return zyTabs;
})();