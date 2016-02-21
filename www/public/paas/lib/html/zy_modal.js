/**
 * UI
 * @class zyModal
 *
 * 用法说明：
 *  var options = {width: '80%'};
 *  var m_ = new zyModal(options,'#mdm_datadict_h1_form'); // 设置参数选项及父元素
 *  m_.Show('.dataTables_wrapper'); // 参数：模态窗口内容子元素
 */
zyModal = (function () {

  var PT = zyModal.prototype;
  var thiz;

  /**
   * 默认参数
   * @attribute defaults
   * @private
   */
  PT.defaults = {
    id: 'zy_modal',
    width: 'auto',
    modal: $('<div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" data-backdrop="static"></div>'),
    m_dialog: $('<div class="modal-dialog" style="width:90%"></div>'),
    m_content: $('<div class="modal-content"></div>'),
    m_header: $('<div class="modal-header"></div>'),
    m_button: $('<button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>'),
    m_closeIcon: $('<i class="fa fa-times-circle fa-2" style="color:#E22403"></i>'),
    m_titleText: '&emsp;数 据',
    m_title: $('<h4 class="modal-title"><i class="fa fa-table"></i></h4>'),
    m_body: $('<div class="modal-body no-padding"></div>')
  };

  /**
   * @class zyModal
   * @constructor
   * @param {Object} options 参数
   * @param {Object} el 容器元素对象
   */
  function zyModal(options, el) {
    zy.log("new zyModal(options, el)");
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

    thiz.opts.m_header.append(thiz.opts.m_button.append(thiz.opts.m_closeIcon));
    thiz.opts.m_header.append(thiz.opts.m_title.append(thiz.opts.m_titleText));
    thiz.opts.m_content.append(thiz.opts.m_header);
    thiz.opts.m_content.append(thiz.opts.m_body);
    thiz.opts.m_dialog.css("width",thiz.opts.width);
    thiz.opts.modal.attr("id",thiz.opts.id);
    thiz.opts.modal.append(thiz.opts.m_dialog.append(thiz.opts.m_content));
    $(thiz.el).append(thiz.opts.modal);
  };

  /**
   * 显示模态窗口
   * @method Show
   * @param {Object} el 载入显示的元素对象
   */
  PT.Show = function (el) {
    thiz.opts.m_body.html($(el));
    $('#' + thiz.opts.id).modal('show');
  };
  return zyModal;
})();