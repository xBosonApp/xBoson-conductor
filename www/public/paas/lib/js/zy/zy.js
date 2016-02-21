/**
 * zy (JS库) 当前库依赖第三方库:
 * 1).jQuery（v1.10.x）： http://jquery.com/
 * 2).json2.js ： 如果浏览器支持JSON.stringify和JSON.parse接口就不需要此库，详细了解：http://www.json.org/
 *
 * 基本功能:
 * zy: 基础库
 *
 * zy.tool: 共通方法
 * zy.tool.regexp:  常用正则表达式
 * zy.tool.String:  字符串操作
 * zy.tool.Date:    日期时间操作
 *
 * zy.net:  ajax异步数据请求等封装
 *
 * zy.ui: 画面处理
 * zy.ui.msg:     提示信息
 * zy.ui.form:    表单操作
 * zy.ui.key:     键盘操作
 * zy.ui.layer:   页面遮罩层
 * zy.ui.browser: 浏览器操作及信息
 *
 * 扩展功能:
 * String:  字符串操作
 * Array:   数组的基本操作
 * Date:    日期的基本操作
 *
 * @method ()
 */
(function () {
  var _win = window.frames[0] ? window.frames[0] : window;
  if (!_win.zy) {
    _win.zy = {};
  }
})();

/** 入口对象 */
var zy = {
  /**
   * 显示当前对象名称及版本
   * @method toString
   * @return {String}
   */
  toString: function () {
    return '{zy} version: 0.0.1';
  },
  /** 开启控制台log输出 */
  debug: true,
  /** 控制台log输出函数封装 */
  log: function () {
      if (window.console && zy.debug) {
          // http://stackoverflow.com/questions/8785624/how-to-safely-wrap-console-log
          Function.apply.call(console.log, console, arguments);
      }
  },
  /** 全局参数 */
  //共通传参用
  g: {
    checkServerOrLocal : function(){
      var hostName = ['192.168.7.120','192.168.7.223','lailibai.com','www.lailibai.com','192.168.7.225','www.zr-i.com'];
      var matchHost = $.grep(hostName, function(i, v) {
        return i == document.location.hostname;
      });
      return matchHost.length > 0
    },
    //主机IP地址
    host: {
      api: 'http://192.168.7.120:8088/ds/',
      ui: 'http://192.168.7.120:8088/'
    },
//  host: {
//    api: 'http://192.168.7.115:8080/ds/',
//    ui: 'http://192.168.7.115:8080/'
//  },
    //共通传参用
    comm: {
      app: '',
      mod: '',
      org: '',
      openid: '',
      s: 'd'
      // mdk: '',// 多设备验证Key，不用IP验证时使用
      // userkeylocal: ''// 本地开发测试使用，部署到服务器时不使用
    },
    //
    am:{},
    //分页用
    page: {pagesize: '20'},
    //机构列表
    org_list: []
  }
};

/** =====================共通方法 */
zy.tool = {
  
  checkTableName:function(str){
    var check1 = /\W/;
    var check2 = /^\d/;
    return !check1.test(str) && !check2.test(str);
  },
  
  path:function(){
    if(location.href.indexOf(location.host + '/t'>-1))
      var u ='http://' + location.host+'/t/saas/'+zy.g.comm.org+'/';
    else
      var u ='http://' + location.host+'/ui/saas/'+zy.g.comm.org+'/';
    // return u;
    return '';
  },
  /**
   * 初始化参数：JSON对象合并 defaults、options 的成员属性
   * @method initParams
   * @example zy.tool.initParams.call({aa:1,bb:2,cc:3}, {aa:10,dd:4}); return {aa:10,bb:2,cc:3,dd:4};
   * @params {Object} defaults JSON类型数据（默认）
   * @params {Object} options JSON类型数据（可选）
   * @return {Object} 返回合并后的JSON对象
   */
  initParams: function (defaults, options) {
    return $.extend({}, defaults, options);
  },
  /**
   * 生成唯一CID编号:时间+4位随机数
   *
   * @method random
   * @return {String} 随机数
   */
  random: function () {
    return new Date().getTime() + '' + Math.round(Math.random() * 10000);
  },
  /**
   * 判断是否含有'.'号
   *
   * @method hasDot
   * @param {String} str 输入字符串
   * @return {Boolean}
   */
  hasDot: function (str) {
    if (typeof str != 'string') {
      return false;
    }
    if (str.indexOf('.') != -1) {
      return true;
    }
    return false;
  },
  /**
   * 判断对象是否为纯整形数字或整形数字字符串 011=9(011 表示8进制)
   *
   * @method isInteger
   * @param {Number/String} obj 输入数字或字符串
   * @return {Boolean}
   */
  isInteger: function (obj) {
    if (obj != parseInt(obj, 10)) {
      return false;
    }
    return true;
  },
  /**
   * 将"undefined"和null转换为空串
   *
   * @method obj2Empty
   * @param {Object} obj 输入对象
   * @return {Object}
   */
  obj2Empty: function (obj) {
    if (typeof obj == "undefined" || obj == null) {
      return '';
    }
    return obj;
  },
  /** 常用正则表达式 */
  regexp: {
    domain: /^[\w-]*(\.[\w-]*)+/ig,
    url: /https?:\/\/[\w-]*(\.[\w-]*)+/ig,
    ftp: /ftp:\/\/[\w-]*(\.[\w-]*)+/ig,
    smtp: /smtp:\/\/[\w-]*(\.[\w-]*)+/ig,
    email: /^[-a-zA-Z0-9_\.]+@([0-9A-Za-z][0-9A-Za-z-]+\.)+[A-Za-z]{2,5}$/,
    ipv4: /^([01]?\d\d?|2[0-4]\d|25[0-5])(\.([01]?\d\d?|2[0-4]\d|25[0-5])){3}$/,
    mac: /^[A-F\d]{2}-[A-F\d]{2}-[A-F\d]{2}-[A-F\d]{2}-[A-F\d]{2}-[A-F\d]{2}$/,
    rang0t65535: /^(\d{1,4}|[1-5]\d{4}|6([0-4]\d{3}|5([0-4]\d{2}|5([0-2]\d|3[0-5]))))$/,
    phone: /(^[0-9]{1,4}\-[0-9]{3,4}\-[0-9]{3,8}$)|(^[0-9]{3,4}\-[0-9]{3,8}$)|(^[0-9]{3,8}$)/, // 9999-9999-99999999可包含国际码
    char_zhcn: /[u4e00-u9fa5]/, //中文字符
    byte: /[^x00-xff]/,
    ascii: /[^\x00-xff]/, //ASCII字符
    blank: /\s/,
    notBlank: /\S/
  }
};
/** =====================字符串操作 */
zy.tool.string = {
  /**
   * 字符串容器类
   *
   * @Class StringBuffer
   * @constructor
   */
  StringBuffer: function () {
    this._string = [];
    /**
     * 向容器内追加数据。
     *
     * @method append
     * @param {String/Number} str 追加字符串或数字
     * @return {Object} zy.tool.string.StringBuffer
     */
    this.append = function (str) {
      var t = typeof str;
      if (t === 'string' || t === 'number') {
        this._string.push(str);
      }
      return this;
    };
        /**
     * 向容器大小。
     *
     * @method size
     * @return {Number} size
     */
    this.size = function () {
      return this._string.length;
    };
    /**
     * 向容器内删除数据。
     *
     * @method remove
     * @param {Number} index 删除的指定位置
     * @return {Object} zy.tool.string.StringBuffer
     */
    this.remove = function (index) {
      if (typeof index === 'number' && index%1 === 0) {
        this._string.splice(index, 1);
      }
      return this;
    };
    /**
     * 以字符串形式显示容器内数据
     *
     * @method toString
     * @param {String/Number} spliter [optional,default=''] 字符串分隔符。
     * @return {String} 容器内所有字符串行集合
     */
    this.toString = function (spliter) {
      var t = typeof spliter;
      if (t !== 'string' && t !== 'number') {
        spliter = '';
      }
      return this._string.join(spliter);
    };
    /**
     * 以数组形式显示容器内数据
     *
     * @method toArray
     * @return {Array} 容器数组
     */
    this.toArray = function () {
      return this._string;
    };
  },
  /**
   * 利用数组的join构造字符串，提高字符串拼接效率
   * @method buildString
   * @param arguments {String|Number}
   * @return {String} 拼接后的字符串
   */
  buildString: function () {
    var str = [];
    for (var i = 0; i < arguments.length; i++) {
      str[i] = arguments[i];
    }
    return str.join("");
  }

};
/** =====================数组基本操作 */
zy.tool.array = {
  /**
   * 数据相减:mArr-sArr,得到的数组是mArr的子集
   *
   * @method arrayReduce
   * @param {Array} mArr 被减数组
   * @param {Array} sArr 减数据
   * @return {Array} 两数组之差
   */
  arrayReduce: function (mArr, sArr) {
    if (!sArr) {
      return mArr;
    }
    var subArr = [],
      str = sArr.join("&quot;&quot;");
    for (var i in mArr) {
      if (str.indexOf(mArr[i]) == -1) {
        subArr.push(mArr[i]);
      }
    }
    return subArr;
  },
  /**
   * json对象数组按对象属性排序
   *
   * @method arraySort
   * @param {String} order 排序规则 asc/desc
   * @param {String} sortBy 对象属性
   */
  arraySort: function (order, sortBy) {
    var ordAlpah = (order == 'asc') ? '>' : '<';
    var sortFun = new Function('a', 'b', 'return a.' + sortBy + ordAlpah + 'b.' + sortBy + '?1:-1');
    for (var i in sortFun) {
      var children = sortFun[i].children;
      if ($(children).length > 0) {
        sortFun[i].children = zy.tool.array.arraySort('asc', children);
      }
    }
    return sortFun;
  }
};
/** =====================日期时间操作 */
zy.tool.Date = {
  /**
   * 将小于10数字前加0
   *
   * @method _zeroCompletion
   * @param {Number} time 时间
   * @return {String}
   */
  _zeroCompletion: function (time) {
    if (time < 10) {
      return '0' + time;
    }
    return time + '';
  },
  /**
   * 将秒转换为时间hh:mm:ss格式
   *
   * @method secs2Time
   * @param {Number} secs 秒
   * @return {String} 格式化时间字符串'00:00:00'
   */
  secs2Time: function (secs) {
    if (secs < 0) {
      secs = 0;
    }
    secs = parseInt(secs, 10);
    var hours = Math.floor(secs / 3600),
      mins = Math
      .floor((secs % 3600) / 60),
      sec = secs % 3600 % 60;
    return this._zeroCompletion(hours) + ':' + this._zeroCompletion(mins) + ':' + this._zeroCompletion(sec);
  },
  /**
   * 格式化日期时间字符串
   *
   * @method dateTime2str
   * @param {Date} dt 日期对象
   * @param {String} fmt 格式化字符串，如：'yyyy-MM-dd hh:mm:ss'
   * @return {String} 格式化后的日期时间字符串
   */
  dateTime2str: function (dt, fmt) {
    var z = {
      M: dt.getMonth() + 1,
      d: dt.getDate(),
      h: dt.getHours(),
      m: dt.getMinutes(),
      s: dt.getSeconds()
    };
    fmt = fmt.replace(/(M+|d+|h+|m+|s+)/g, function (v) {
      return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1)))
        .slice(-2);
    });
    return fmt.replace(/(y+)/g, function (v) {
      return dt.getFullYear().toString().slice(-v.length);
    });
  },
  /**
   * 根据日期时间格式获取获取当前日期时间
   *
   * @method dateTimeWrapper
   * @param {String} fmt 日期时间格式，如："yyyy-MM-dd hh:mm:ss";
   * @return {String} 格式化后的日期时间字符串
   */
  dateTimeWrapper: function (fmt) {
    if (arguments[0])
      fmt = arguments[0];
    return this.dateTime2str(new Date(), fmt);
  },
  /**
   * 获取当前日期时间
   *
   * @method getDatetime
   * @param {String} fmt [optional,default='yyyy-MM-dd hh:mm:ss'] 日期时间格式。
   * @return {String} 格式化后的日期时间字符串
   */
  getDatetime: function (fmt) {
    return this.dateTimeWrapper(fmt || 'yyyy-MM-dd hh:mm:ss');
  },
  /**
   * 获取当前日期时间+毫秒
   *
   * @method getDatetimes
   * @param {String} fmt [optional,default='yyyy-MM-dd hh:mm:ss'] 日期时间格式。
   * @return {String} 格式化后的日期时间字符串
   */
  getDatetimes: function (fmt) {
    var dt = new Date();
    return this.dateTime2str(dt, fmt || 'yyyy-MM-dd hh:mm:ss') + '.' + dt.getMilliseconds();
  },
  /**
   * 获取当前日期（年-月-日）
   *
   * @method getDate
   * @param {String} fmt [optional,default='yyyy-MM-dd'] 日期格式。
   * @return {String} 格式化后的日期字符串
   */
  getDate: function (fmt) {
    return this.dateTimeWrapper(fmt || 'yyyy-MM-dd');
  },
  /**
   * 获取当前时间（时:分:秒）
   *
   * @method getTime
   * @param {String} fmt [optional,default='hh:mm:ss'] 日期格式。
   * @return {String} 格式化后的时间字符串
   */
  getTime: function (fmt) {
    return this.dateTimeWrapper(fmt || 'hh:mm:ss');
  },
  /**
   * 将标准日期时间格式转换为长整形格式
   * @param {String} datetime 为空或 yyyy-MM-dd hh:mm:ss 格式时间
   * @returns {number}
   */
  dateTime2Long: function (datetime) {
    if (datetime && typeof datetime === "string") {
      return new Date(datetime.replace(/\-/g, '/')).getTime();
    }
    return new Date().getTime();
  },
  /**
   * 初始化日期段选择器，依赖于jQueryUI的日期控件
   *
   * @method initDatePickerRange
   * @param {String} datefrom 开始日期id
   * @param {String} dateto 结束日期id
   */
  initDatePickerRange: function (datefrom, dateto) {
    var picker = $('#' + datefrom + ',' + '#' + dateto),
      dates = {};
    dates = picker.datepicker({
      changeMonth: true,
      numberOfMonths: 1,
      dateFormat: 'yy-mm-dd',
      onSelect: function (selectedDate) {
        var option = this.id == datefrom ? "minDate" : "maxDate",
          instance = $(this).data(
            "datepicker"),
          date = $.datepicker.parseDate(
            instance.settings.dateFormat || $.datepicker._defaults.dateFormat,
            selectedDate, instance.settings);
        dates.not(this).datepicker("option", option, date);
      },
      setDate: new Date()
    }).datepicker('setDate', new Date());
  }
};
/** =====================ajax异步数据请求等封装 */
zy.net = {
  /**
   * websocket
   * @param {String} uri 请求链接地址 测试:"ws://echo.websocket.org/"
   * @param {function} 接收信息的回调函数
   * @return {object} websocket对象
   */

  zyWebSocket : function(host,cb) {
    //检查状态并输出
    function MsgAndCheck(readyState){
      var arr = [0, 1, 2, 3];
      var match = ['连接尚未建立','WebSocket的链接已经建立','连接正在关闭','连接已经关闭或不可用'];
      for (i in arr){
        if(arr[i] == readyState)
          zy.log(match[i]);
      }
      return readyState == 1;
    }

    if (!host)
      return;
    var socket;
    try {
      socket = new WebSocket(host);
    } catch(e) {
      zy.log(e);
    }

    socket.onopen = function(msg) {
      if(!MsgAndCheck(socket.readyState))
       return socket = null
    };

    socket.onmessage = function(msg) {
      if(!MsgAndCheck(socket.readyState))
        return;
      cb && cb(msg.data);
    };
    socket.onclose = function(msg) {
    };

    socket.sendData = function(data) {
      if (data){
        if(MsgAndCheck(socket.readyState)){
          socket.send(data);
        }
      } else {
        zy.ui.msg('提示信息', '发送内容空', 'w');
      }
    };

    socket.quit = function() {
      socket.close();
      socket = null;
      return zy.log(host + '已经断开');
    }
    return socket
  },

  /**
   * GET 方式调用API服务（支持跨域提交）
   * @method get
   * @param {String} uri 请求链接地址
   * @param {Function} callback 回调函数
   * @param {Object} param 发送请求参数json对象或表单对象：$('#formid').serialize();
   * @param {Number} pagenum 页码;
   * @param {Function} error 服务器端传来错误信息时使用 error 回调函数处理错误，将返回出错 JSON 数据
   */
  get: function (uri, callback, param, pagenum, error) {
    //关闭AJAX的缓存(全局属性)
    //$.ajaxSetup({cache: false});
    var prm = zy.tool.initParams(zy.g.comm, zy.g.am);
    if (pagenum) {
      zy.g.pages = {
        pagesize: zy.g.am.pagesize || zy.g.page.pagesize,
        pagenum:pagenum
      };
      prm = zy.tool.initParams(prm, zy.g.pages);
    }
    zy.g.am = {};
    //设置Url及参数
    var link;
    if (uri.indexOf('ETLServer') != -1) {
      link = zy.g.host.api.substring(0, zy.g.host.api.length - 3) + uri + "?" + zy.net.parseParam(prm);
    } else {
      link = zy.g.host.api + uri + "?" + zy.net.parseParam(prm);
    }
    zy.log("zy.net.get.link: " + link);
    zy.log("zy.net.get.param: " + JSON.stringify(param));
    $.ajax({
      url: link,
      type: "get",
      async: false,
      timeout: 10000,
      cache: true,
      dataType: "jsonp",
      jsonp: "cb",
      jsonpCallback: "cb" + zy.tool.random(),
      data: param,
      success: function (msg) {
        zy.log("zy.net.get.success: " + JSON.stringify(msg));
        zy.net.errorHandler(msg, callback, error);
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        if (textStatus == "timeout") {
          zy.ui.msg("访问超时: ", link + "\r\n" + errorThrown, "e");
        }
        zy.log("zy.net.get.error: " + XMLHttpRequest + "\r\n" + textStatus + "\r\n" + errorThrown);
        throw {
          XMLHttpRequest: XMLHttpRequest,
          textStatus: textStatus,
          errorThrown: errorThrown
        };
      }
    });
  },

  /**
   * POST 方式调用API服务
   * @method post
   * @param {String} uri 请求链接地址
   * @param {Function} callback 回调函数
   * @param {Object} param 发送请求参数json对象
   * @param {Number} pagenum 页码;
   * @param {Function} error 服务器端传来错误信息时使用 error 回调函数处理错误，将返回出错 JSON 数据
   */
  post: function (uri, callback, param, pagenum, error) {
    var prm = zy.tool.initParams(zy.g.comm, zy.g.am);
    zy.g.am = {};
    if (pagenum) {
      zy.g.pages = {
        pagesize:zy.g.page.pagesize,
        pagenum:pagenum
      };
      prm = zy.tool.initParams(prm, zy.g.pages);
    }
    //设置Url及参数
    var link = zy.g.host.api + uri + "?" + zy.net.parseParam(prm);
    zy.log("zy.net.post.link: " + link);
    zy.log("zy.net.post.param: " + JSON.stringify(param));
    $.post(link, param, function (msg) {
      zy.net.errorHandler(JSON.parse(msg), callback, error);
    });
  },

  /**
   * ajaxSubmit 方式调用API服务
   * @method postForm
   * @param {String} uri 请求链接地址
   * @param {Object} form 请求 Form 对象
   * @param {Function} callback 回调函数
   * @param {Function} error 服务器端传来错误信息时使用 error 回调函数处理错误，将返回出错 JSON 数据
   */
  postForm: function (uri, form, callback, error) {
    var prm = zy.tool.initParams(zy.g.comm, zy.g.am);
    zy.g.am = {};
    //设置Url及参数
    var link = zy.g.host.api + uri + "?" + zy.net.parseParam(prm);
    zy.log("zy.net.postSubmit.link: " + link);
    form.ajaxSubmit({
      url: link,
      type: "post",
      async: false,
      timeout: 10000,
      cache: false,
      dataType: "json",
      success: function (msg) {
        zy.log("zy.net.get.success: " + JSON.stringify(msg));
        zy.net.errorHandler(msg, callback, error);
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        if (textStatus == "timeout") {
          zy.ui.msg("访问超时: ", link + "\r\n" + errorThrown, "e");
        }
        zy.log("zy.net.get.error: " + XMLHttpRequest + "\r\n" + textStatus + "\r\n" + errorThrown);
        throw {
          XMLHttpRequest: XMLHttpRequest,
          textStatus: textStatus,
          errorThrown: errorThrown
        };
      }
    });
  },

  /**
   * 用js生成一个form，并用这个form提交参数，实现无刷新返回“流”类型数据
   * @method postDownload
   * @param {String} uri 请求链接地址
   * @param {Object} container 包含动态生成 Form 的容器
   * @param {String} file_name 下载文件名
   * @param {String} file_type 下载文件类型
   * @param {String} category 知识库分类
   * @param {String} down_type 下载类型
   */
  postDownload: function (uri, param) {
    $('#tmpDownloadForm').remove();
   var  container = $("<div>").attr('id','tmpDownloadForm').css('display','none');
    $('body').append(container);
    var prm = zy.tool.initParams(zy.g.comm, zy.g.am);
    zy.g.am = {};
    //设置Url及参数
    var link = zy.g.host.api + uri + "?" + zy.net.parseParam(prm);
    var tmpDownloadForm = $("<form>");  // 定义一个form表单
    tmpDownloadForm.attr("style", "display:none");
    tmpDownloadForm.attr("target", "");
    tmpDownloadForm.attr("method", "post");
    tmpDownloadForm.attr("action", link);
    container.append(tmpDownloadForm);  // 将表单放置在web中
		for(var key in param){
			var input = $("<input>");
			input.attr("type", "hidden");
      input.attr("name", key);
      input.attr("value", param[key]);
			tmpDownloadForm.append(input);
		}
    tmpDownloadForm.submit();           // 表单提交
  },

  loadIndex : function() {
    var _path = 'ui/paas/main.html';
    if(zy.g.comm.orgtype && zy.g.comm.orgtype !== 'v')
      _path = 'ui/saas/' + zy.g.comm.org + '/main.html';
    window.location = _path;
  },

  loadLogin : function() {
    parent.$('body').addClass('animated fadeOutUp');
    parent.location = '../../login.html';
  },

  /**
   * 采用同步或异步方式调用API服务
   * @method load
   * @param {String} uri 请求链接地址
   * @param {Boolean} async 是否采用异步方式加载数据，true或undefined时为异步方式，false为同步方式
   * @param {Function} callback 采用异步方式的回调函数
   * @param {Object} param 发送请求时附带参数数据
   * @return {String} responseText 采用同步方式时直接返回结果，采用异步方式时将返回 undefined
   */
  load: function (uri, async, callback, param) {
    var prm = zy.tool.initParams(zy.g.comm, zy.g.am);
    zy.g.am = {};
    var link = zy.g.host.api + uri + "?" + zy.net.parseParam(prm);
    zy.log("zy.net.load.link = " + link);
    var cur = this;
    return $.ajax({
      url: link,
      success: function (msg) {
        if (callback)
          callback.call(cur, msg);
      },
      data: param,
      async: async,
      type: "post"
    }).responseText;
  },

  /**
   * AJAX LOAD HTML PAGES
   * @method loadHTML
   * @param {String} url 请求页面链接地址
   * @param {Object} container 父容器
   * @param {Function} callback 回调函数
   */
  loadHTML: function (url, container, callback) {
    var _u;
    var test = new RegExp(location.host+'/t');
    zy.log('1 loadHTML:test=='+test);
    var path = zy.g.comm.orgpath;
    zy.log('2 loadHTML:path=='+path);
    if(test.test(location.href))
      _u = 'http://'+location.host+'/t/'+path+'/'+url;
    else
      _u = 'http://'+location.host+'/ui/'+path+'/'+url;
    zy.log('3 loadHTML:_u=='+_u);
    $.ajax({
      type: "get",
      url: _u,
      dataType: 'html',
      cache: true,
      async: false,
      beforeSend: function () {
        // cog placed
        container.html('<h1><i class="fa fa-cog fa-spin"></i> 加载中...</h1>');
      },
      /*complete: function(){
            // zy.log("complete");
		},*/
      success: function (data) {
  	    var host = location.host;
  	    var test = new RegExp(host+'\/t');
  	    var real = test.test(location.href)?'//'+host+'/t/':'//'+host+'/ui/';
        var result = _out(data,path);
        // cog replaced here...
        zy.log("loadHTML: success " + url);
        container.css({
          opacity : '0.0'
        }).html(result).delay(50).animate({
          opacity : '1.0'
        }, 300);
        setTimeout(function() {
          if (callback) {
            callback(data);
          }
        }, 300);
      },

      error: function (xhr, ajaxOptions, thrownError) {
        container.html('<h4 style="margin-top:10px; display:block; text-align:left"><i class="fa fa-warning txt-color-orangeDark"></i> Error 404! 找不到网页。<br>' + url + '</h4>');
      }
    });
  },

  /**
   * AJAX LOAD PAGES
   * @method loadPage
   * @param {String} url 请求页面链接地址
   * @param {Function} callback 回调函数
   */
  loadPage: function (url, callback) {
    zy.log("loadPage: " + url);
    $.ajax({
      type: "get",
      url: url,
      dataType: 'html',
      cache: true,
      async: false,
      success: function (data) {
        // cog replaced here...
        zy.log("loadPage: success " + url);
        if (callback)
          callback(data);
      },
      error: function (xhr, ajaxOptions, thrownError) {
        zy.ui.msg('找不到网页：', '<h4 style="margin-top:10px; display:block; text-align:left"><i class="fa fa-warning txt-color-orangeDark"></i> Error 404! 找不到网页。<br>' + url + '</h4>', 'e');
      }
    });
  },

  //LOAD JAVA SCRIPTS 数组
  jsArray: {},
  /**
   * LOAD JAVA SCRIPTS
   * @method loadScript
   * Usage:Define function = myPrettyCode ()...
   * loadScript("lib/js/my_script.js", myPrettyCode);
   * @param {String} url 脚本链接地址
   * @param {Function} callback 回调函数
   */
  loadScript: function (url, callback) {
    if (!zy.net.jsArray[url]) {
      zy.net.jsArray[url] = true;
      var _d = null;
      // adding the script tag to the head as suggested before
      window.frames[0] ? _d = window.frames[0].document : _d = document;
      
      var body = _d.getElementsByTagName('body')[0];
      var script = _d.createElement('script');
      script.type = 'text/javascript';
      script.src = url;

      // then bind the event to the callback function
      // there are several events for cross browser compatibility
      //script.onreadystatechange = callback;
      script.onload = callback;

      // fire the loading
      body.appendChild(script);

    } else if (callback) { // changed else to else if(callback)
      zy.log("zy.net.loadScript().callback(): " + url + " JS 文件已经加载!");
      //execute function
      callback();
    }
  },
  /**
   * 初始状态信息，该方法用来从服务器端加载一段js，用eval执行来初始化全局变量
   * @method initStatus
   * @param {String} url 请求链接地址
   */
  initStatus: function (url) {
    var status = zy.net.load(url, false);
    if (status)
      eval(status);
  },

  /**
   * 处理服务器端返回的JSON类型数据结果，判断是否为出错信息，并提供两种方式处理错误
   * @method errorHandler
   * @param {String} msg 服务器传来待处理的 JSON 格式字符串
   * @param {Function} success 无错误时的回调函数，该回调将获得处理过后的 JSON 数据
   * @param {Boolean} error 服务器端传来错误信息时使用 error 回调函数处理错误，将返回出错 JSON 数据，
   *                      undefined为使用系统弹窗显示错误，然后再调用error回调处理
   */
  errorHandler: function (msg, success, error) {
    try {
      var ret = msg.ret;
      zy.log("Response.msg: " + ret + " : " + msg.msg);
      if ("0" === ret) {
        // 正常返回
        return success(msg);
      } else if ("1000" === ret || "1006" === ret || "1005" === ret || "1009" === ret || "1012" === ret) {
        // 用户没有登录状态 1000 登录超时 1006 用户已在其他设备登录 1005 用户登录异常 1009 OpenID 不合法 1012
        if($('.SmallBox ').length == 0) zy.ui.msg("您需要重新登录：", msg.msg, "i");
        setTimeout(zy.net.loadLogin, 3000);
      } else {
        if (error) {
          return error(msg);
        } else {
          zy.log("Response.Error: " + msg.msg);
          zy.ui.msg("服务器请求失败", ret + " : " + msg.msg, "e");
          success(null);
          return false;
        }
      }
    } catch (e) {
      if (typeof e.stack != 'undefined') {
        zy.log("Response.json.Error.stack: " + e.stack + "\r\n" + e.message);
        zy.ui.msg("Response.json.Error: ", e.stack + "\r\n" + e.message, "e");
      } else {
        zy.log("Response.json.Error.message: " + e.message);
        zy.ui.msg("Response.json.Error.message: ", e.message, "e");
      }
    }
  },

  /**
   * 获得以“http://”开头的链接地址，并加上当前域的HOST名称,例如 zy.net.getHttpUrl("/ds/api")将返回"http://ip/ds/api"
   * @method getHttpUrl
   * @return {String} url 返回处理好的链接地址
   */
  getHttpUrl: function (url) {
    var host = "http://" + zy.ui.browser.getHost() + zy.ui.browser.getPort();
    if (!url)
      return host;
    if (url.indexOf("/") == 0) {
      url = host + url;
    } else {
      url = host + "/" + url;
    }
    return url;
  },
  /**
   * JSON对象转url参数字符串,例如返回"name=tom&className=class1"
   * @method parseParam
   * @params {Object} params JSON类型数据
   * @return {String} 返回处理好的字符串
   * //调用：
   * var obj={name:'tom','class':{className:'class1'},classMates:[{name:'lily'}]};
   * parseParam(obj); 结果："name=tom&class.className=class1&classMates[0].name=lily"
   * parseParam(obj,'stu'); 结果："stu.name=tom&stu.class.className=class1&stu.classMates[0].name=lily"
   */
  parseParam: function (param) {
    if (!param) {
      return '';
    }
    var tmps = [];
    for (var key in param) {
      tmps.push(key + '=' + encodeURIComponent(param[key]));
    }
    return tmps.join('&');
  }

};
/**
 * var zn = new zyNet();
 * zn.get("api/" + obj.api, _cb);
 */
zyNet = (function () {
  var PT = zyNet.prototype;

  /**
   * 默认参数
   * @attribute defaults
   * @private
   */
  var opts = {
    async: false,
    timeout: 10000,
    cache: true
  };

  function zyNet(options) {
    zy.log("new zyNet(options)");
    // 合并初始化参数选项
    $.extend({}, opts, options);
  }

  /**
   * GET 方式调用API服务（支持跨域提交）
   * @method get
   * @param {String} uri 请求链接地址
   * @param {Function} callback 回调函数
   * @param {Object} param 发送请求参数json对象或表单对象：$('#formid').serialize();
   * @param {Number} pagenum 页码;
   * @param {Function} error 服务器端传来错误信息时使用 error 回调函数处理错误，将返回出错 JSON 数据
   */
  PT.get = function (uri, callback, param, pagenum, error) {
    //关闭AJAX的缓存(全局属性)
    //$.ajaxSetup({cache: false});
    var prm = zy.tool.initParams(zy.g.comm, zy.g.am);
    zy.g.am = {};
    if (pagenum) {
      zy.g.pages = {
        pagesize:zy.g.page.pagesize,
        pagenum:pagenum
      };
      prm = zy.tool.initParams(prm, zy.g.pages);
    }
    //设置Url及参数
    var link = zy.g.host.api + uri + "?" + zy.net.parseParam(prm);
    zy.log("zyNet.get.link: " + link);
    zy.log("zyNet.get.param: " + JSON.stringify(param));
    $.ajax({
      url: link,
      type: "get",
      async: opts.async,
      timeout: opts.timeout,
      cache: opts.cache,
      dataType: "jsonp",
      jsonp: "cb",
      jsonpCallback: "cb" + zy.tool.random(),
      data: param,
      success: function (msg) {
        zy.log("zyNet.get.success: " + JSON.stringify(msg));
        errorHandler(msg, callback, error);
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        if (textStatus == "timeout") {
          zy.ui.msg("访问超时: ", link + "\r\n" + errorThrown, "e");
        }
        zy.log("zyNet.get.error: " + XMLHttpRequest + "\r\n" + textStatus + "\r\n" + errorThrown);
        throw {
          XMLHttpRequest: XMLHttpRequest,
          textStatus: textStatus,
          errorThrown: errorThrown
        };
      }
    });
  };
  /**
   * 处理服务器端返回的JSON类型数据结果，判断是否为出错信息，并提供两种方式处理错误
   * @method errorHandler
   * @param {String} msg 服务器传来待处理的 JSON 格式字符串
   * @param {Function} success 无错误时的回调函数，该回调将获得处理过后的 JSON 数据
   * @param {Boolean} error 服务器端传来错误信息时使用 error 回调函数处理错误，将返回出错 JSON 数据，
   *                      undefined为使用系统弹窗显示错误，然后再调用error回调处理
   */
  function errorHandler(msg, success, error) {
    try {
      var ret = msg.ret;
      zy.log("Response.msg: " + ret + " : " + msg.msg);
      if ("0" === ret) {
        // 正常返回
        return success(msg);
      } else if ("1000" === ret || "1006" === ret || "1005" === ret || "1009" === ret || "1012" === ret) {
        // 用户没有登录状态 1000 登录超时 1006 用户已在其他设备登录 1005 用户登录异常 1009 OpenID 不合法 1012
        zy.ui.msg("您需要重新登录：", msg.msg, "i");
        setTimeout(zy.net.loadLogin, 3000);
      } else {
        if (error) {
          return error(msg);
        } else {
          zy.log("Response.Error: " + msg.msg);
          zy.ui.msg("服务器请求失败", ret + " : " + msg.msg, "e");
          success(null);
          return false;
        }
      }
    } catch (e) {
      if (typeof e.stack != 'undefined') {
        zy.log("Response.json.Error.stack: " + e.stack + "\r\n" + e.message);
        zy.ui.msg("Response.json.Error: ", e.stack + "\r\n" + e.message, "e");
      } else {
        zy.log("Response.json.Error.message: " + e.message);
        zy.ui.msg("Response.json.Error.message: ", e.message, "e");
      }
    }
  }
  return zyNet;
})();
/** =====================画面处理 */
zy.ui = {
  /**
   * CSS式样处理字符串超出部分用省略号替代
   *
   * @method ellipsis
   * @param {element} obj 目标元素对象
   * @param {Number} px 指定元素宽度的像素值，不指定默认为元素原有宽度
   */
  ellipsis: function (obj, i) {
    if (i) {
      obj.css("width", i + "px");
    }
    obj.css({
      "white-space": "nowrap",
      "word-break": "keep-all",
      "overflow": "hidden",
      "text-overflow": "ellipsis"
    });
  },
  /**
   * 颜色取反，如将白色'#ffffff'转换为黑色'#000000'
   *
   * @method colorInverse
   * @param {String} color 颜色16进制字符表示形式，如：'#ff0000'，表示红色。
   * @return {String} 取反后的颜色
   */
  colorInverse: function (color) {
    color = !color ? '' : color;
    color = parseInt(color.replace('#', '0x'));
    var r = color >> 16,
      g = color >> 8 & 0x0000ff,
      b = color & 0x0000ff,
      _r = 255 - r,
      _g = 255 - g,
      _b = 255 - b,
      clr = '#' + (_r << 16 | _g << 8 | _b).toString(16);
    return clr == '#0' ? '#000000' : clr;
  },
  /**
   * 信息提示
   * @method msg
   * @param {String} title 标题
   * @param {String} msg 内容
   * @param {String} type 提示类型：i=Info/s=Success/w=Warning/e=Error
   */
  msg: function (title, msg, type) {
    var color = "#3276b1";
    var content = "提示信息";
    var iconSmall = "fa fa-thumbs-up bounce animated";
    var timeout;
    var icon;

    switch (type) {
    case "i":
      color = "#305d8c";
      content = "<i class='fa-fw fa fa-info'></i> <i>" + msg + "</i>";
      iconSmall = "fa fa-bell bounce animated";
      timeout = 5000;
      break;
    case "s":
      color = "#356635";
      content = "<i class='fa-fw fa fa-check'></i> <i>" + msg + "</i>";
      iconSmall = "fa fa-smile-o bounce animated";
      timeout = 4000;
      break;
    case "w":
      color = "#826430";
      content = "<i class='fa-fw fa fa-warning'></i> <i>" + msg + "</i>";
      iconSmall = "fa fa-shield bounce animated";
      break;
    case "e":
      color = "#953b39";
      content = "<i class='fa-fw fa fa-times'></i> <i>" + msg + "</i>";
      iconSmall = "fa fa-frown-o bounce animated";
      icon = "fa-fw fa fa-times";
    }
    $.smallBox({
      title: title,
      content: content,
      color: color,
      iconSmall: iconSmall,
      timeout: timeout,
      icon: icon
    });
  },

  /**
   * 信息提示
   * @method msg
   * @param {String} title 标题
   * @param {String} msg 内容
   * @param {String} type 提示类型：i=Info/s=Success/w=Warning/e=Error
   * @param {function} 关闭时回调
   */
  bigBox : function (title, msg, type,cb){
    var typeCode = ['i','s','w','e'];
    var typeObj = [{
      color: "#3276B1",
      icon: "fa fa-bell swing animated"
    },{
      color: "#356635",
      icon: "fa fa-smile-o bounce animated"
    },{
      color: "#826430",
      icon: "fa fa-shield bounce animated"
    },{
      color: "#953b39",
      icon: "fa fa-frown-o bounce animated"
    }];

    var bigBoxOption = {
      title : title,
      content : msg
    };

    for (i in typeCode){
      if(typeCode[i] == type)
        var opt = $.extend({},bigBoxOption,typeObj[i]);
    }

     return $.bigBox(opt,function(){
      cb && cb();
    });
},

/**
   * 弹出dialog
   * @method dig
   * @param {String} title 为dialog标题
   * @param {String} content 为dialog内容
   * @param {Function} cb1 为确认按钮事件
   * @param {Function} cb2 为取消按钮事件
   */
 mask :  function (title,content,cb1,cb2) {
    var div = $('<div></div>');
    var cont = '<p style="text-align:center;color:red;font-size:16px">'+content+'</p>';
    var title ='<div class="widget-header"><h4><i class="fa fa-warning"></i> '+ title+'</h4></div>';
    var dialog = div.dialog({
      autoOpen: true,
      width: 600,
      resizable: false,
      draggable : false,
      modal: true,
      title: '',
      buttons: [
        {
          html: "<i class='fa fa-trash-o'></i>&nbsp; 确定",
        "class": "btn btn-danger",
          click: function(){
            cb1 && cb1();
            div.dialog('close');
          }
        },
        {
          html: "<i class='fa fa-times'></i>&nbsp; 取消",
        "class": "btn btn-default",
          click: function(){
            cb2 && cb2();
            div.dialog('close');
          }
        }
      ]
    });
    dialog.siblings('.ui-dialog-titlebar').children('span').append(title);
    dialog.append(cont);
  },
  /**
   * 以 window.open 方式打开弹窗
   * @method window
   * @param {String} url      转向网页的地址
   * @param {String} name     网页名称，可为空
   * @param {Number} iWidth   弹出窗口的宽度
   * @param {Number} iHeight  弹出窗口的高度
   */
  window: function (url, name, iWidth, iHeight) {
    var iTop = (window.screen.availHeight - 30 - iHeight) / 2;
    // 获得窗口的垂直位置;
    var iLeft = (window.screen.availWidth - 10 - iWidth) / 2;
    // 获得窗口的水平位置;
    window.open(url, name, 'height=' + iHeight + ',,innerHeight=' + iHeight + ',width=' + iWidth + ',innerWidth=' + iWidth + ',top=' + iTop + ',left=' + iLeft + ',toolbar=no,menubar=no,scrollbars=auto,resizeable=no,location=no,status=no');
  }
};
/** =====================表单操作 */
zy.ui.form = {
  /**
   * 获取单选框值,如果有表单就在表单内查询,否则在全文查询
   *
   * @method getRadioValue
   * @param {String}name radio名称
   * @param {Object} frm [optional,default=document] jQuery表单（或其它容器对象）对象
   * @return {Object} radio jQuery对象
   */
  getRadioValue: function (name, frm) {
    if (frm && frm.find)
      return frm.find('input[name="' + name + '"]:checked').val();
    return $('input[name="' + name + '"]:checked').val();
  },
  /**
   * 设置单选框值,如果有表单就在表单内查询,否则在全文查询。
   *
   * @method setRadioValue
   * @param {String} name radio名称
   * @param {String} value radio表单value值
   * @param {Object} frm [optional,default=document] jQuery表单（或其它容器对象）对象
   * @return {Object} radio jQuery对象
   */
  setRadioValue: function (name, value, frm) {
    if (frm && frm.find)
      return frm
        .find('input[name="' + name + '"][value="' + value + '"]')
        .attr('checked', true);
    return $('input[name="' + name + '"][value="' + value + '"]').attr(
      'checked', true);
  },
  /**
   * 设置select下拉框的值
   *
   * @method setRadioValue
   * @param {String} selectId 下拉框id号
   * @param {String/Number} value select表单value值
   * @param {Object} frm [optional,default=document] jQuery表单（或其它容器对象）对象
   * @return {Object} select jQuery对象
   */
  setSelectValue: function (selectId, value, frm) {
    if (frm && frm.find)
      return frm.find('#' + selectId + ' option[value="' + value + '"]')
        .attr('selected', true);
    return $('#' + selectId + ' option[value="' + value + '"]').attr(
      'selected', true);
  },
  /**
   * 将object转换为select的列表模式，key为option的value，值为option的文本。
   *
   * @method object2Options
   * @param {Object}objects key-map对象
   * @return {String} html
   */
  object2Options: function (objects) {
    if (!$.isPlainObject(objects)) {
      return '';
    }
    var html = [];
    for (var i in objects) {
      html.push('<option value="' + i + '">' + objects[i] + '</option>');
    }
    return html.join('');
  },
  /**
   * checkboxes、radio、selects 元素对象的选择或取消选择处理
   * @param {Object} obj 对象(checkboxes、radio、selects)
   * @method selected
   * @param {Boolean} select 参数，true 选择（默认值），false 取消选择
   */
  selected: function (obj, select) {
    if (select === undefined) {
      select = true;
    }
    return obj.each(function () {
      var t = obj.type;
      if (t == 'checkbox' || t == 'radio') {
        obj.checked = select;
      } else if (obj.tagName.toLowerCase() == 'option') {
        var $sel = $(obj).parent('select');
        if (select && $sel[0] && $sel[0].type == 'select-one') {
          // deselect all other options
          $sel.find('option').selected(false);
        }
        obj.selected = select;
      }
    });
  },
  /**
   * 将输入控件集合序列化成对象， 名称或编号作为键，value属性作为值。
   *
   * @method _serializeInputs
   * @param {Array} inputs input/select/textarea的对象集合
   * @return {Object} json 对象 {key:value,...}
   */
  _serializeInputs: function (inputs) {
    var json = {};
    if (!inputs) {
      return json;
    }
    for (var i = inputs.length - 1; i >= 0; i--) {
      var input = $(inputs[i]),
        type = input.attr('type');
      if (type) {
        type = type.toLowerCase();
      }
      var tagName = input.get(0).tagName,
        id = input.attr('id'),
        name = input
        .attr('name'),
        value = null;

      // 判断输入框是否已经序列化过
      if (input.hasClass('_isSerialized') || (typeof id == 'undefined' && typeof name == 'undefined')) {
        continue;
      }

      // input输入标签
      if (tagName == 'INPUT' && type) {
        switch (type) {
        case 'checkbox':
          {
            value = input.is(':checked');
          }
          break;
        case 'radio':
          {
            if (input.is(':checked')) {
              value = input.attr('value');
            } else {
              continue;
            }
          }
          break;
        default:
          {
            value = input.val();
          }
        }
      } else {
        // 非input输入标签，如：select,textarea
        value = input.val();
      }

      json[name || id] = value;
      // 清除序列化标记
      input.removeClass('_isSerialized');
    }
    return json;
  },
  /**
   * 将值填充到输入标签里面。
   *
   * @method _deserializeInputs
   * @param {Array} inputs 输入标签集合
   * @param {String/Number} value 值
   * @return {Object} zy.ui.form
   */
  _deserializeInputs: function (inputs, value) {
    if (!inputs && value === null) {
      return this;
    }
		if(value == null){
			value = '';
		}

    for (var i = inputs.length - 1; i >= 0; i--) {
      var input = $(inputs[i]);
      // 判断输入框是否已经序列化过
      if (input.hasClass('_isSerialized')) {
        continue;
      }
      var type = input.attr('type');
      if (type) {
        type = type.toLowerCase();
      }
      if (type) {
        switch (type) {
        case 'checkbox':
          {
            input.attr('checked', value);
          }
          break;
        case 'radio':
          {
            input.each(function (i) {
              var thiz = $(this);
              if (thiz.attr('value') == value) {
                thiz.attr('checked', true);
              }
            });
          }
          break;
          case 'hidden':
          {
            var str = value.trim();
            if (str.length > 0) {
              // 预留判断select2，并赋值
              if ('select2' === input.data("type")) {
                input.select2("val", str);
              } else {
                // 其它直接赋值
                input.val(str);
              }
            }
          }
          break;
        default:
          {
            var str = value.trim();
            if (str.length > 0 && input.hasClass("datepicker")) {
              var dataDateFormat = input.attr('data-format') || 'yyyy-MM-dd';
              str = $.format.date(str, dataDateFormat.replace(/m/g, "M"));
            }
            input.val(str);
          }
        }
      } else {
        var str = value.trim();
        if (str.length > 0 && input.hasClass("datepicker")) {
          var dataDateFormat = input.attr('data-format') || 'yyyy-MM-dd';
          str = $.format.date(str, dataDateFormat.replace(/m/g, "M"));
        }
        input.val(str);
      }
      input.addClass('_isSerialized');
    }
    return this;
  },
  /**
   * 在分组中查找 fieldset (如：fieldset="user")开头的数据域。
   *
   * @method _serializeGroups
   * @param {Array} groups 输入框分组容器集合
   * @return {Object} json 对象 {key:value,...}
   */
  _serializeGroups: function (groups) {
    var json = {};
    if (!groups) {
      return json;
    }
    for (var i = groups.length - 1; i >= 0; i--) {
      var group = $(groups[i]),
        key = group.attr('fieldset');
      if (!key) {
        continue;
      }
      var inputs = group
        .find('input[type!=button][type!=reset][type!=submit],select,textarea');
      json[key] = this._serializeInputs(inputs);
      // 添加序列化标记
      inputs.addClass('_isSerialized');
    }
    return json;
  },
  /**
   * 序列化表单值,结果以key/value形式返回key为表单对象名称(name||id),value为其值。<br>
   * HTML格式：<br>
   * 1).表单容器：通常是一个form表单（如果不存在就以body为父容器），里面包含输入标签和子容器;<br>
   * 2).子容器（也可以没有）：必须包括属性fieldset="XXXX" div标签，里面包含输入标签和子容器。<br>
   * 序列化后将生成以XXX为主键的json对象.如果子容器存在嵌套则以fieldset为主键生成不同分组的json对象。<br>
   * 3).输入标签：输入标签为input类型标签（包括：'checkbox','color','date','datetime','datetime-local',<br>
   * 'email','file','hidden','month','number','password','radio','range
   * ','reset','search','submit',<br>
   * 'tel','text','time ','url','week'）。
   * 而'button','reset','submit','image'会被过虑掉。
   *
   * @method serialize
   * @param {Object} frm jQuery表单对象
   * @return {Object} json对象，最多包含两层结构
   */
  serialize: function (frm) {
    var json = {};
    frm = frm || $('body');
    if (!frm) {
      return json;
    }
    var groups = frm.find('div[fieldset]');
    var jsonGroup = this._serializeGroups(groups);
    var inputs = frm.find('input[type!=button][type!=reset][type!=submit][type!=image],select,textarea');
    json = this._serializeInputs(inputs);

    for (var key in jsonGroup) {
      json[key] = jsonGroup[key];
    }
    return json;
  },
  /**
   * 填充表单内容：将json数据形式数据填充到表单内，只解析单层json结构。
   *
   * @method deserializeSimple
   * @param {Object} frm jQuery表单对象（或其它容器标签对象，如：div）
   * @param {Object} json 序列化好的json数据对象，最多只包含两层嵌套
   * @return {Object} zy.ui.form
   */
  deserializeSimple: function (frm, json) {
    frm = frm || $('body');
    if (!frm || !json) {
      return this;
    }

    var _deserializeInputs = this._deserializeInputs;
    for (var key in json) {
      var value = json[key];
      _deserializeInputs(frm, key, value);
    }
    return this;
  },
  /**
   * 获取合法的输入标签。
   *
   * @method _filterInputs
   * @param {Object} container jQuery对象，标签容器
   * @return {Array} inputs jQuery对象数组
   */
  _filterInputs: function (container) {
    return $(container
      .find('input[type!=button][type!=reset][type!=submit][type!=image][type!=file],select,textarea'));
  },
  /**
   * 查找符合条件的输入标签。
   *
   * @method _findInputs
   * @param {Array} inputs jQueery输入标签数组
   * @param {String} key 查询关键字
   * @return {Array} inputs jQuery对象数组
   */
  _findInputs: function (inputs, key) {
    return $(inputs.filter('input[name=' + key + '],input[id=' + key + '],textarea[name=' + key + '],textarea[id=' + key + '],select[name=' + key + '],select[id=' + key + ']'));
  },
  /**
   * 填充表单内容：将json数据形式数据填充到表单内，最多解析两层json结构。
   *
   * @method deserialize
   * @param {Object} frm jQuery表单对象（或其它容器标签对象，如：div）
   * @param {Object} json 序列化好的json数据对象，最多只包含两层嵌套
   * @return {Object} zy.ui.form
   */
  deserialize: function (frm, json) {
    frm = frm || $('body');
    if (!frm || !json) {
      return this;
    }

    // objects缓存json第一层数据对象;
    // groups缓存json嵌套层数据（第二层），将首先被赋值，以避免覆盖
    var objects = {},
      groups = {};

    // 数据分组
    for (var key in json) {
      var value = json[key];
      if ($.isPlainObject(value)) {
        groups[key] = value;
      } else {
        objects[key] = value;
      }
    }

    var _deserializeInputs = this._deserializeInputs,
      _filterInputs = this._filterInputs,
      _findInputs = this._findInputs;

    // 填充嵌套层数据
    for (var key in groups) {
      var json = groups[key],
        div = frm.find('div[fieldset="' + key + '"]');
      if (!div.length) {
        continue;
      }
      var inputs = _filterInputs(div);
      if (!inputs.length) {
        continue;
      }
      for (var k in json) {
        var val = json[k],
          input = _findInputs(inputs, k);
        _deserializeInputs(input, val);
      }
    }

    // 填充第一层数据
    var inputs = _filterInputs(frm);
    for (var key in objects) {
      var value = objects[key],
        input = _findInputs(inputs, key);
      _deserializeInputs(input, value);
    }

    inputs.filter('._isSerialized').removeClass('_isSerialized');
    return this;
  }
};
/** =====================键盘操作 */
zy.ui.key = {
  /** 常用键盘码对象。 */
  keycode: {
    /**
     * 全屏F11(122)
     *
     * @type {Number}
     * @property F11
     */
    F11: 122,
    /**
     * 退出Esc(27)
     *
     * @type {Number}
     * @property ESC
     */
    ESC: 27,
    /**
     * 回车Enter(13)
     *
     * @type {Number}
     * @property ENTER
     */
    ENTER: 13,
    /**
     * 上一页Page Up(33)
     *
     * @type {Number}
     * @property PAGEUP
     */
    PAGEUP: 33,
    /**
     * 下一页Page Down(34)
     *
     * @type {Number}
     * @property PAGEDOWN
     */
    PAGEDOWN: 34,
    /**
     * 页尾end(35)
     *
     * @type {Number}
     * @property END
     */
    END: 35,
    /**
     * 页首home(36)
     *
     * @type {Number}
     * @property HOME
     */
    HOME: 36,
    /**
     * 左箭头left(37)
     *
     * @type {Number}
     * @property LEFT
     */
    LEFT: 37,
    /**
     * 向上箭头up(38)
     *
     * @type {Number}
     * @property UP
     */
    UP: 38,
    /**
     * 右前头(39)
     *
     * @type {Number}
     * @property RIGHT
     */
    RIGHT: 39,
    /**
     * 向下箭头down(40)
     *
     * @type {Number}
     * @property DOWN
     */
    DOWN: 40
  },
  /**
   * 绑定键盘事件到元素，当焦点在元素上并触发键盘事件时响应该函数。
   *
   * @method _bindKey
   * @param {Number} zy.ui.keycode 键盘码
   * @param {Object} element 被绑定元素的jQuery对象
   * @param {Function} callback 回调函数，参数为绑定的元素对象element和事件e
   */
  _bindKey: function (keycode, element, callback) {
    element.keydown(function (e) {
      if (e.keyCode == keycode) {
        if (typeof callback == 'function')
          callback(element, e);
      }
    });
  },
  /**
   * 在element区域内响应Enter键盘事件。<br>
   * 实际处理中应该将提交按键(type="submit")放在element区域外,避免重复提交。
   *
   * @method bindEnterKey
   * @param {Object} element 被绑定元素的jQuery对象
   * @param {Function} callback 回调函数，参数为绑定的元素对象element和事件e
   * @return {Object} zy.ui.key
   */
  bindEnterKey: function (element, callback) {
    this._bindKey(this.keycode.ENTER, element, callback);
    return this;
  },
  /**
   * 在element区域内响应Esc键盘事件。
   *
   * @method bindEscKey
   * @param {Object} element 被绑定元素的jQuery对象
   * @param {Function} callback 回调函数，参数为绑定的元素对象element和事件e
   * @return {Object} zy.ui.key
   */
  bindEscKey: function (element, callback) {
    this._bindKey(this.keycode.ESC, element, callback);
    return this;
  },
  /**
   * 在element区域内响应F11键盘事件。
   *
   * @method bindF11Key
   * @param {Object} element 被绑定元素的jQuery对象
   * @param {Function} callback 回调函数，参数为绑定的元素对象element和事件e
   * @return {Object} zy.ui.key
   */
  bindF11Key: function (element, callback) {
    this._bindKey(this.keycode.F11, element, callback);
    return this;
  },
  /**
   * 在element区域内响应Page Down键盘事件。
   *
   * @method bindPageDownKey
   * @param {Object} element 被绑定元素的jQuery对象
   * @param {Function} callback 回调函数，参数为绑定的元素对象element和事件e
   * @return {Object} zy.ui.key
   */
  bindPageDownKey: function (element, callback) {
    this._bindKey(this.keycode.PAGEDOWN, element, callback);
    return this;
  },
  /**
   * 在element区域内响应Page Up键盘事件。
   *
   * @method bindPageUpKey
   * @param {Object} element 被绑定元素的jQuery对象
   * @param {Function} callback 回调函数，参数为绑定的元素对象element和事件e
   * @return {Object} zy.ui.key
   */
  bindPageUpKey: function (element, callback) {
    this._bindKey(this.keycode.PAGEUP, element, callback);
    return this;
  },
  /**
   * 在element区域内响应Left键盘事件。
   *
   * @method bindLeftKey
   * @param {Object} element 被绑定元素的jQuery对象
   * @param {Function} callback 回调函数，参数为绑定的元素对象element和事件e
   * @return {Object} zy.ui.key
   */
  bindLeftKey: function (element, callback) {
    this._bindKey(this.keycode.LEFT, element, callback);
    return this;
  },
  /**
   * 在element区域内响应Right键盘事件。
   *
   * @method bindRightKey
   * @param {Object} element 被绑定元素的jQuery对象
   * @param {Function} callback 回调函数，参数为绑定的元素对象element和事件e
   * @return {Object} zy.ui.key
   */
  bindRightKey: function (element, callback) {
    this._bindKey(this.keycode.RIGHT, element, callback);
    return this;
  },
  /**
   * 在element区域内响应Up键盘事件。
   *
   * @method bindUpKey
   * @param {Object} element 被绑定元素的jQuery对象
   * @param {Function} callback 回调函数，参数为绑定的元素对象element和事件e
   * @return {Object} zy.ui.key
   */
  bindUpKey: function (element, callback) {
    this._bindKey(this.keycode.UP, element, callback);
    return this;
  },
  /**
   * 在element区域内响应Down键盘事件。
   *
   * @method bindDownKey
   * @param {Object} element 被绑定元素的jQuery对象
   * @param {Function} callback 回调函数，参数为绑定的元素对象element和事件e
   * @return {Object} zy.ui.key
   */
  bindDownKey: function (element, callback) {
    this._bindKey(this.keycode.DOWN, element, callback);
    return this;
  }
};
/** =====================遮盖层工具，包括页面遮盖和元素遮盖 */
zy.ui.layer = {
  /**
   * 创建遮盖层(如果已经存在遮蔽层就先清除)。
   *
   * @method add
   * @param {String} content 显示信息
   * @return {Object} zy.ui.layer
   */
  add: function (content) {
    if ($('#zy-layer').length > 0) {
      this.clear();
    }
    var tip = "数据处理中...";
    if (!content) {
      tip = content;
    }
    var div = $('<div></div>'),
      doc = $(document),
      txt = $(['<span>', tip,
   '</span>'].join(''));
    div.attr('id', 'zy-layer').html(txt);

    var _resetPos = function () {
      var offset = doc.height() / 2 + doc.scrollTop();
      txt.css({
        top: offset,
        left: (doc.width() - txt.width()) / 2,
        position: 'absolute'
      });
      div.css({
        height: doc.height()
      });
    };
    $('body').append(div);
    _resetPos();
    $(window).bind('resize scroll', function () {
      _resetPos();
    });
    return this;
  },
  /**
   * 清除遮盖层。
   *
   * @method clear
   * @return {Object} zy.ui.layer
   */
  clear: function () {
    $('#zy-layer').remove();
    return this;
  },
  /**
   * 清除所有遮盖层
   * @return {Object} zy.ui.layer
   */
  clearAll: function () {
    $('.zy-mask').remove();
    return this;
  },
  /**
   * 添加遮盖层信息。
   *
   * @method addInfo
   * @param {String} info 显示信息
   * @param {Boolean} isAppend 追加或重写信息。true-追加信息到之前内容;false-替换已有信息
   * @return {Object} zy.ui.layer
   */
  addInfo: function (info, isAppend) {
    var span = $('#zy-layer span');
    isAppend ? span.append(info) : span.html(info);
    return this;
  },
  /**
   * 为对象添加遮盖层。
   *
   * @method mask
   * @param {Object} obj jQuery对象
   * @param {String} info 显示信息
   * @return {Object} mask jQuery对象
   */
  mask: function (obj, info) {
    $('#' + obj.attr('masker')).remove();
    var id = 'zy-mask-' + zy.tool.random(),
      o_h = obj.outerHeight(),
      o_w = obj.outerWidth(),
      pos = obj.position(),
      txt = $(['<div>',
        (info ? info : ''), '</div>'].join('')),
      mask = $(['<div class="zy-mask" id="', id, '">123444445</div>'].join(''));
    obj.after(mask).attr('masker', id);
    mask.append(txt).css({
      position: 'absolute',
      top: pos.top,
      left: pos.left,
      height: o_h,
      width: o_w
    });
    txt.css({
      top: (o_h - txt.height()) / 2,
      left: (o_w - txt.width()) / 2
    });
    return mask;
  },
  /**
   * 清除对象mask。
   *
   * @method clearMask
   * @param {Object} obj jQuery对象 被屏蔽的对象,如果没有就清除所有对象mask
   * @return {Object} zy.ui.layer
   */
  clearMask: function (obj) {
    if (obj) {
      $('#' + obj.attr('masker')).remove();
    } else {
      $('.zy-mask').remove();
    }
    return this;
  },
  /**
   * 将元素移动到文档中间。
   *
   * @method move2Center
   * @param {Object} obj jQuery对象
   * @param {Boolean} adaptive 自动适应文档可视区大小同时改变对象位置
   * @param {Number} zIndex 层叠顺序
   * @return {Object} obj jQuery对象
   */
  move2Center: function (obj, adaptive, zIndex) {
    var doc = $(document),
      _resetPos = function () {
        obj.css({
          'z-index': zIndex ? zIndex : 0,
          position: 'absolute',
          left: (doc.width() - obj.width()) / 2,
          top: doc.scrollTop() + (($.browser.msie ? doc.height() : window.innerHeight) - obj.height()) / 2
        });
      };
    _resetPos();
    if (adaptive) {
      $(window).bind('resize scroll', function () {
        _resetPos();
      });
    }
    return obj;
  }
};
/** =====================浏览器操作及信息 */
zy.ui.browser = {
  /**
   * 浏览器名称
   *
   * @type {String}
   * @property name
   */
  name: '',
  /**
   * 浏览器主版本号,如：8
   *
   * @type {String}
   * @property version
   */
  version: '',
  /**
   * 浏览器详细版本号,如：8.2.11
   *
   * @type {String}
   * @property versions
   */
  versions: '',
  /**
   * 获取浏览器Agent信息,并返回包含name/version/versioins键的对象
   *
   * @method agent
   * @return {Object} {name : '浏览器名称', version : '浏览器主版本号', versions :
   *                  '浏览器详细版本号' }
   */
  agent: function () {
    var browser = {},
      userAgent = navigator.userAgent.toLowerCase(),
      s;
    (s = userAgent.match(/msie ([\d.]+)/)) ? browser.ie = s[1] : (s = userAgent.match(/firefox\/([\d.]+)/)) ? browser.firefox = s[1] : (s = userAgent.match(/chrome\/([\d.]+)/)) ? browser.chrome = s[1] : (s = userAgent.match(/opera.([\d.]+)/)) ? browser.opera = s[1] : (s = userAgent
      .match(/version\/([\d.]+).*safari/)) ? browser.safari = s[1] : 0;

    var name = '',
      version = '';
    if (browser.ie) {
      name = 'msie';
      version = browser.ie;
    } else if (browser.firefox) {
      name = 'firefox';
      version = browser.firefox;
    } else if (browser.chrome) {
      name = 'chrome';
      version = browser.chrome;
    } else if (browser.opera) {
      name = 'opera';
      version = browser.opera;
    } else if (browser.safari) {
      name = 'safari';
      version = browser.safari;
    } else {
      name = 'unknown';
    }
    return {
      name: name,
      version: version.split('.')[0],
      versions: version
    };
  },
  /**
   * 获取域名或主机IP
   *
   * @method getHost
   * @return {String}
   */
  getHost: function () {
    return location.host.split(':')[0];
  },
  /**
   * 获取主机端口号，如果是 80 则返回空字符串
   *
   * @method getPort
   * @return {String}
   */
  getPort: function () {
    var ret = '';
    var port = location.host.split(':')[1];
    if (port && port !== '80') {
      ret = ':' + port;
    }
    return ret;
  },
  /**
   * 获取浏览器语言代码,如:'zh-CN'
   *
   * @method getLang
   * @return {String} 语言代码
   */
  getLang: function () {
    var nav = window.navigator;
    return (nav.language || nav.userLanguage);
  },
  /**
   * 获取URL地址栏参数值
   *
   * @method getParameter
   * @param {String} name 参数名
   * @param {String} url [optional,default=当前URL]URL地址
   * @return {String} 参数值
   */
  getParameter: function (name, url) {
    var paramStr = url || window.location.search;
    if (paramStr.length == 0) {
      return null;
    }
    if (paramStr.charAt(0) != "?") {
      return null;
    }
    paramStr = unescape(paramStr).substring(1);
    if (paramStr.length == 0) {
      return null;
    }
    var params = paramStr.split('&');
    for (var i = 0; i < params.length; i++) {
      var parts = params[i].split('=', 2);
      if (parts[0] == name) {
        if (parts.length < 2 || typeof (parts[1]) === "undefined" || parts[1] == "undefined" || parts[1] == "null")
          return '';
        return parts[1];
      }
    }
    return null;
  },
  /**
   * 更新浏览器地址栏链接地址
   * @method updateUrl
   * @param {String} url
   */
  updateUrl: function (url) {
    if (window.history && window.history.pushState) {
      window.history.pushState(null, url, url);
    }
  },

  /**
   * 转到上一页（缓存页）
   *
   * @method goPrevPage
   * @return zy.ui.browser
   */
  goPrevPage: function () {
    history.go(-1);
    return this;
  },
  /**
   * 转到下一页
   *
   * @method goNextPage
   * @return zy.ui.browser
   */
  goNextPage: function () {
    history.go(1);
    return this;
  },
  /**
   * 转到当前页(刷新页面)
   *
   * @method refreshPage
   * @return zy.ui.browser
   */
  refreshPage: function () {
    history.go(0);
    return this;
  },
  /**
   * 设置主页
   *
   * @method setHomepage
   * @param {String} url 设置的URL
   * @return zy.ui.browser
   */
  setHomepage: function (url) {
    url = (url ? url : location.href);
    if (document.all) {
      document.body.style.behavior = 'url(#default#homepage)';
      document.body.setHomePage(url);
    } else if (window.sidebar) {
      if (window.netscape) {
        try {
          window.netscape.security.PrivilegeManager
            .enablePrivilege("UniversalXPConnect");
        } catch (e) {
          zy.ui.msg('此操作被浏览器拒绝！', '请在地址栏输入"about:config"并回车然后将[signed.applets.codebase_principal_support]的值设置为true', 'w');
        }
      }
      try {
        var prefs = Components.classes['@mozilla.org/preferences-service;1']
          .getService(Components.interfaces.nsIPrefBranch);
        prefs.setCharPref('browser.startup.homepage', url);
      } catch (e) {
        zy.ui.msg('提示信息', '设置失败', 'e');
      }
    } else {
      zy.ui.msg('提示信息', '请用Ctrl+D将地址添加到收藏夹', 'i');
    }
    return this;
  },
  /**
   * Firefox需要手动开启dom.allow_scripts_to_close_windows<br>
   * about:config -> dom.allow_scripts_to_close_windows = true。
   *
   * @method closeWin
   */
  closeWin: function () {
    window.opener = null;
    window.open('', '_self');
    window.close();
  },

  /**
   * 取消事件冒泡
   *
   * @method stopBubble
   * @param {Object} e 事件对象
   */
  stopBubble: function (e) {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    } else {
      // ie
      window.event.cancelBubble = true;
    }
  },
  /**
   * 阻止浏览器默认行为
   *
   * @method stopDefault
   * @param {Object} e 事件对象
   * @return {Boolean}
   */
  stopDefault: function (e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    } else {
      // ie
      window.event.returnValue = false;
    }
    return false;
  },

  /**
   * 检测插件是否存在,如:'Quicktime'/'Quicktime.Quicktime'<br>
   * IE浏览器控件的名称通道和其它浏览器插件名称不一致
   *
   * @method checkPlugin
   * @param {String} name 插件名称
   * @param {String} nameIE [optional,default=name] IE浏览器ActiveX插件名称
   * @return {Boolean} true-插件已经安装;false-未安装
   */
  checkPlugin: function (name, nameIE) {
    var ie = '';
    if (typeof nameIE === 'undefined') {
      ie = name;
    } else {
      ie = nameIE;
    }
    return this.hasPluginIE(ie) || this.hasPlugin(name);
  },
  /**
   * 检测非IE浏览器插件是否存在
   *
   * @method hasPlugin
   * @param {String} name 插件名称
   * @return {Boolean} true-插件已经安装;false-未安装
   */
  hasPlugin: function (name) {
    if (!name)
      return false;
    name = name.toLowerCase();
    var plugins = window.navigator.plugins;
    for (var i = 0; i < plugins.length; i++) {
      if (plugins[i] && plugins[i].name.toLowerCase().indexOf(name) > -1) {
        return true;
      }
    }
    return false;
  },
  /**
   * 检测IE浏览器插件是否存在
   *
   * @method hasPluginIE
   * @param {String} name IE浏览器ActiveX插件名称
   * @return {Boolean} true-插件已经安装;false-未安装
   */
  hasPluginIE: function (name) {
    if (!name)
      return false;
    try {
      new ActiveXObject(name);
      return true;
    } catch (ex) {
      return false;
    }
  },

  /**
   * 判断当前是否处在iframe中
   * @method isIframe
   * @return {Boolean}
   */
  isIframe: function () {
    return top.location != self.location;
  },
  /**
   * 判断当前不处在iframe中
   * @method isIframe
   * @return {Boolean}
   */
  isNotIframe: function () {
    return !isIframe();
  }
};
/** =====================dataTable初始化参数 */
zy.ui.dataTable = {
  "language": {
      "sProcessing": "处理中...",
      "sLengthMenu": "显示 _MENU_ 项结果",
      "sZeroRecords": "没有匹配结果",
      "sInfo": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
      "sInfoEmpty": "显示第 0 至 0 项结果，共 0 项",
      "sInfoFiltered": "(由 _MAX_ 项结果过滤)",
      "sInfoPostFix": "",
      "sSearch": "搜索:",
      "sUrl": "",
      "sEmptyTable": "表中数据为空",
      "sLoadingRecords": "载入中...",
      "sInfoThousands": ",",
      "oPaginate": {
        "sFirst": "首页",
        "sPrevious": "上页",
        "sNext": "下页",
        "sLast": "末页"
      },
      "oAria": {
        "sSortAscending": ": 以升序排列此列",
        "sSortDescending": ": 以降序排列此列"
      }
  },
  "searching": false,
  "autoWidth": false,
  "paging": false,
  "ordering": false,
  "info": false,
  "destroy": true,
  "scrollY": false,
  "scrollCollapse": false,
  "scrollX": true
};
/** =====================Select2 */
zy.ui.Select2 = {
  /**
   * Select2 扩展
   *
   * @method Set 目标元素：<input type="hidden" name="el" id="el" style="width:300px" placeholder="类别名称"/>
   * @param {String} type 数据字典类别
   * @param {String} el 元素对象
   * @param {Boolean} flg 默认不追加全部选项，值为空
   * @param {Object} options 参数
   */
  Set: function (type, el, flg, options) {
    var all = {id: '', name: '全部', text: '全部(QB)'};
    // 调用共通方法：通过类别请求缓存数据，当此类别缓存数据不存在调用ajax
    var data;
    var ls = zy.cache.get('_mdm_dict', 'ls');
    if (ls.isSet(type) && !ls.isEmpty(type)) {
      data = ls.get(type);
    }
    zy.log("data = " + JSON.stringify(data));
    if (flg && data)
      data.splice(0,0,all);
    var defaults = {
      placeholder: "查找...", //默认显示的文本
      allowClear: true, //选择后出现清除按钮图标
      formatSelection: function(item){return item.name;},
      formatResult: function(item){return item.name;},
      sortResults: function (results, container, query) {
        //排序
        if (query.term) {   //query.term为输入的内容
          // use the built in javascript sort function
          return results.sort(function (a, b) {
            if (a.text.indexOf(query.term) > b.text.indexOf(query.term)) {
              return 1;
            } else if (a.text.indexOf(query.term) < b.text.indexOf(query.term)) {
              return -1;
            } else {
              return 0;
            }
          });
        }
        return results;
      },
      data: {results: data, text: 'text'} //指定数据源
    };
    var opt = $.extend(true, {}, defaults, options);
    el.select2(opt);
  },
  /**
   * Select2 扩展
   *
   * @method SetCustomData 目标元素：<input type="hidden" name="el" id="el" style="width:300px" placeholder="类别名称"/>
   * @param {String} type 数据字典类别
   * @param {String} el 元素对象
   * @param {Boolean} flg 默认不追加全部选项，值为空
   * @param {Object} options 参数
   * @param {Object} customData 自定义绑定数据
   */
  SetCustomData: function (type, el, flg, options, customData) {
    var all = {id: '', name: '全部', text: '全部(QB)'};
    // 调用共通方法：通过类别请求缓存数据，当此类别缓存数据不存在调用ajax
    var data = customData;
    zy.log("data = " + JSON.stringify(data));
    if (flg && data)
      data.splice(0,0,all);
    var defaults = {
      placeholder: "查找...", //默认显示的文本
      allowClear: true, //选择后出现清除按钮图标
      formatSelection: function(item){return item.name;},
      formatResult: function(item){return item.name;},
      sortResults: function (results, container, query) {
        //排序
        if (query.term) {   //query.term为输入的内容
          // use the built in javascript sort function
          return results.sort(function (a, b) {
            if (a.text.indexOf(query.term) > b.text.indexOf(query.term)) {
              return 1;
            } else if (a.text.indexOf(query.term) < b.text.indexOf(query.term)) {
              return -1;
            } else {
              return 0;
            }
          });
        }
        return results;
      },
      data: {results: data, text: 'text'} //指定数据源
    };
    var opt = $.extend(true, {}, defaults, options);
    el.select2(opt);
  },
  /**
   * Select2 扩展 图标选择
   *
   * @method Icons 目标元素：<input type="hidden" name="icons" placeholder="图标" style="width:300px"/>
   * @param {String} el 元素对象
   * @param {Object} options 参数
   */
  Icons: function (el, options) {
    var icons = [
      { text: "【Web应用类图标】", children: [
        { id: "fa-adjust", text: "fa-adjust" },
        { id: "fa-anchor", text: "fa-anchor" },
        { id: "fa-archive", text: "fa-archive" },
        { id: "fa-arrows", text: "fa-arrows" },
        { id: "fa-arrows-h", text: "fa-arrows-h" },
        { id: "fa-arrows-v", text: "fa-arrows-v" },
        { id: "fa-asterisk", text: "fa-asterisk" },
        { id: "fa-automobile", text: "fa-automobile" },
        { id: "fa-ban", text: "fa-ban" },
        { id: "fa-bank", text: "fa-bank" },
        { id: "fa-bar-chart-o", text: "fa-bar-chart-o" },
        { id: "fa-barcode", text: "fa-barcode" },
        { id: "fa-bars", text: "fa-bars" },
        { id: "fa-beer", text: "fa-beer" },
        { id: "fa-bell", text: "fa-bell" },
        { id: "fa-bell-o", text: "fa-bell-o" },
        { id: "fa-bolt", text: "fa-bolt" },
        { id: "fa-bomb", text: "fa-bomb" },
        { id: "fa-book", text: "fa-book" },
        { id: "fa-bookmark", text: "fa-bookmark" },
        { id: "fa-bookmark-o", text: "fa-bookmark-o" },
        { id: "fa-briefcase", text: "fa-briefcase" },
        { id: "fa-bug", text: "fa-bug" },
        { id: "fa-building", text: "fa-building" },
        { id: "fa-building-o", text: "fa-building-o" },
        { id: "fa-bullhorn", text: "fa-bullhorn" },
        { id: "fa-bullseye", text: "fa-bullseye" },
        { id: "fa-cab", text: "fa-cab" },
        { id: "fa-calendar", text: "fa-calendar" },
        { id: "fa-calendar-o", text: "fa-calendar-o" },
        { id: "fa-camera", text: "fa-camera" },
        { id: "fa-camera-retro", text: "fa-camera-retro" },
        { id: "fa-car", text: "fa-car" },
        { id: "fa-caret-square-o-down", text: "fa-caret-square-o-down" },
        { id: "fa-caret-square-o-left", text: "fa-caret-square-o-left" },
        { id: "fa-caret-square-o-right", text: "fa-caret-square-o-right" },
        { id: "fa-caret-square-o-up", text: "fa-caret-square-o-up" },
        { id: "fa-certificate", text: "fa-certificate" },
        { id: "fa-check", text: "fa-check" },
        { id: "fa-check-circle", text: "fa-check-circle" },
        { id: "fa-check-circle-o", text: "fa-check-circle-o" },
        { id: "fa-check-square", text: "fa-check-square" },
        { id: "fa-check-square-o", text: "fa-check-square-o" },
        { id: "fa-child", text: "fa-child" },
        { id: "fa-circle", text: "fa-circle" },
        { id: "fa-circle-o", text: "fa-circle-o" },
        { id: "fa-circle-o-notch", text: "fa-circle-o-notch" },
        { id: "fa-circle-thin", text: "fa-circle-thin" },
        { id: "fa-clock-o", text: "fa-clock-o" },
        { id: "fa-cloud", text: "fa-cloud" },
        { id: "fa-cloud-download", text: "fa-cloud-download" },
        { id: "fa-cloud-upload", text: "fa-cloud-upload" },
        { id: "fa-code", text: "fa-code" },
        { id: "fa-code-fork", text: "fa-code-fork" },
        { id: "fa-coffee", text: "fa-coffee" },
        { id: "fa-cog", text: "fa-cog" },
        { id: "fa-cogs", text: "fa-cogs" },
        { id: "fa-comment", text: "fa-comment" },
        { id: "fa-comment-o", text: "fa-comment-o" },
        { id: "fa-comments", text: "fa-comments" },
        { id: "fa-comments-o", text: "fa-comments-o" },
        { id: "fa-compass", text: "fa-compass" },
        { id: "fa-credit-card", text: "fa-credit-card" },
        { id: "fa-crop", text: "fa-crop" },
        { id: "fa-crosshairs", text: "fa-crosshairs" },
        { id: "fa-cube", text: "fa-cube" },
        { id: "fa-cubes", text: "fa-cubes" },
        { id: "fa-cutlery", text: "fa-cutlery" },
        { id: "fa-dashboard", text: "fa-dashboard" },
        { id: "fa-database", text: "fa-database" },
        { id: "fa-desktop", text: "fa-desktop" },
        { id: "fa-dot-circle-o", text: "fa-dot-circle-o" },
        { id: "fa-download", text: "fa-download" },
        { id: "fa-edit", text: "fa-edit" },
        { id: "fa-ellipsis-h", text: "fa-ellipsis-h" },
        { id: "fa-ellipsis-v", text: "fa-ellipsis-v" },
        { id: "fa-envelope", text: "fa-envelope" },
        { id: "fa-envelope-o", text: "fa-envelope-o" },
        { id: "fa-envelope-square", text: "fa-envelope-square" },
        { id: "fa-eraser", text: "fa-eraser" },
        { id: "fa-exchange", text: "fa-exchange" },
        { id: "fa-exclamation", text: "fa-exclamation" },
        { id: "fa-exclamation-circle", text: "fa-exclamation-circle" },
        { id: "fa-exclamation-triangle", text: "fa-exclamation-triangle" },
        { id: "fa-external-link", text: "fa-external-link" },
        { id: "fa-external-link-square", text: "fa-external-link-square" },
        { id: "fa-eye", text: "fa-eye" },
        { id: "fa-eye-slash", text: "fa-eye-slash" },
        { id: "fa-fax", text: "fa-fax" },
        { id: "fa-female", text: "fa-female" },
        { id: "fa-fighter-jet", text: "fa-fighter-jet" },
        { id: "fa-file-archive-o", text: "fa-file-archive-o" },
        { id: "fa-file-audio-o", text: "fa-file-audio-o" },
        { id: "fa-file-code-o", text: "fa-file-code-o" },
        { id: "fa-file-excel-o", text: "fa-file-excel-o" },
        { id: "fa-file-image-o", text: "fa-file-image-o" },
        { id: "fa-file-movie-o", text: "fa-file-movie-o" },
        { id: "fa-file-pdf-o", text: "fa-file-pdf-o" },
        { id: "fa-file-photo-o", text: "fa-file-photo-o" },
        { id: "fa-file-picture-o", text: "fa-file-picture-o" },
        { id: "fa-file-powerpoint-o", text: "fa-file-powerpoint-o" },
        { id: "fa-file-sound-o", text: "fa-file-sound-o" },
        { id: "fa-file-video-o", text: "fa-file-video-o" },
        { id: "fa-file-word-o", text: "fa-file-word-o" },
        { id: "fa-file-zip-o", text: "fa-file-zip-o" },
        { id: "fa-film", text: "fa-film" },
        { id: "fa-filter", text: "fa-filter" },
        { id: "fa-fire", text: "fa-fire" },
        { id: "fa-fire-extinguisher", text: "fa-fire-extinguisher" },
        { id: "fa-flag", text: "fa-flag" },
        { id: "fa-flag-checkered", text: "fa-flag-checkered" },
        { id: "fa-flag-o", text: "fa-flag-o" },
        { id: "fa-flash", text: "fa-flash" },
        { id: "fa-flask", text: "fa-flask" },
        { id: "fa-folder", text: "fa-folder" },
        { id: "fa-folder-o", text: "fa-folder-o" },
        { id: "fa-folder-open", text: "fa-folder-open" },
        { id: "fa-folder-open-o", text: "fa-folder-open-o" },
        { id: "fa-frown-o", text: "fa-frown-o" },
        { id: "fa-gamepad", text: "fa-gamepad" },
        { id: "fa-gavel", text: "fa-gavel" },
        { id: "fa-gear", text: "fa-gear" },
        { id: "fa-gears", text: "fa-gears" },
        { id: "fa-gift", text: "fa-gift" },
        { id: "fa-glass", text: "fa-glass" },
        { id: "fa-globe", text: "fa-globe" },
        { id: "fa-graduation-cap", text: "fa-graduation-cap" },
        { id: "fa-group", text: "fa-group" },
        { id: "fa-hdd-o", text: "fa-hdd-o" },
        { id: "fa-headphones", text: "fa-headphones" },
        { id: "fa-heart", text: "fa-heart" },
        { id: "fa-heart-o", text: "fa-heart-o" },
        { id: "fa-history", text: "fa-history" },
        { id: "fa-home", text: "fa-home" },
        { id: "fa-image", text: "fa-image" },
        { id: "fa-inbox", text: "fa-inbox" },
        { id: "fa-info", text: "fa-info" },
        { id: "fa-info-circle", text: "fa-info-circle" },
        { id: "fa-institution", text: "fa-institution" },
        { id: "fa-key", text: "fa-key" },
        { id: "fa-keyboard-o", text: "fa-keyboard-o" },
        { id: "fa-language", text: "fa-language" },
        { id: "fa-laptop", text: "fa-laptop" },
        { id: "fa-leaf", text: "fa-leaf" },
        { id: "fa-legal", text: "fa-legal" },
        { id: "fa-lemon-o", text: "fa-lemon-o" },
        { id: "fa-level-down", text: "fa-level-down" },
        { id: "fa-level-up", text: "fa-level-up" },
        { id: "fa-life-bouy", text: "fa-life-bouy" },
        { id: "fa-life-ring", text: "fa-life-ring" },
        { id: "fa-life-saver", text: "fa-life-saver" },
        { id: "fa-lightbulb-o", text: "fa-lightbulb-o" },
        { id: "fa-location-arrow", text: "fa-location-arrow" },
        { id: "fa-lock", text: "fa-lock" },
        { id: "fa-magic", text: "fa-magic" },
        { id: "fa-magnet", text: "fa-magnet" },
        { id: "fa-mail-forward", text: "fa-mail-forward" },
        { id: "fa-mail-reply", text: "fa-mail-reply" },
        { id: "fa-mail-reply-all", text: "fa-mail-reply-all" },
        { id: "fa-male", text: "fa-male" },
        { id: "fa-map-marker", text: "fa-map-marker" },
        { id: "fa-meh-o", text: "fa-meh-o" },
        { id: "fa-microphone", text: "fa-microphone" },
        { id: "fa-microphone-slash", text: "fa-microphone-slash" },
        { id: "fa-minus", text: "fa-minus" },
        { id: "fa-minus-circle", text: "fa-minus-circle" },
        { id: "fa-minus-square", text: "fa-minus-square" },
        { id: "fa-minus-square-o", text: "fa-minus-square-o" },
        { id: "fa-mobile", text: "fa-mobile" },
        { id: "fa-mobile-phone", text: "fa-mobile-phone" },
        { id: "fa-money", text: "fa-money" },
        { id: "fa-moon-o", text: "fa-moon-o" },
        { id: "fa-mortar-board", text: "fa-mortar-board" },
        { id: "fa-music", text: "fa-music" },
        { id: "fa-navicon", text: "fa-navicon" },
        { id: "fa-paper-plane", text: "fa-paper-plane" },
        { id: "fa-paper-plane-o", text: "fa-paper-plane-o" },
        { id: "fa-paw", text: "fa-paw" },
        { id: "fa-pencil", text: "fa-pencil" },
        { id: "fa-pencil-square", text: "fa-pencil-square" },
        { id: "fa-pencil-square-o", text: "fa-pencil-square-o" },
        { id: "fa-phone", text: "fa-phone" },
        { id: "fa-phone-square", text: "fa-phone-square" },
        { id: "fa-photo", text: "fa-photo" },
        { id: "fa-picture-o", text: "fa-picture-o" },
        { id: "fa-plane", text: "fa-plane" },
        { id: "fa-plus", text: "fa-plus" },
        { id: "fa-plus-circle", text: "fa-plus-circle" },
        { id: "fa-plus-square", text: "fa-plus-square" },
        { id: "fa-plus-square-o", text: "fa-plus-square-o" },
        { id: "fa-power-off", text: "fa-power-off" },
        { id: "fa-print", text: "fa-print" },
        { id: "fa-puzzle-piece", text: "fa-puzzle-piece" },
        { id: "fa-qrcode", text: "fa-qrcode" },
        { id: "fa-question", text: "fa-question" },
        { id: "fa-question-circle", text: "fa-question-circle" },
        { id: "fa-quote-left", text: "fa-quote-left" },
        { id: "fa-quote-right", text: "fa-quote-right" },
        { id: "fa-random", text: "fa-random" },
        { id: "fa-recycle", text: "fa-recycle" },
        { id: "fa-refresh", text: "fa-refresh" },
        { id: "fa-reorder", text: "fa-reorder" },
        { id: "fa-reply", text: "fa-reply" },
        { id: "fa-reply-all", text: "fa-reply-all" },
        { id: "fa-retweet", text: "fa-retweet" },
        { id: "fa-road", text: "fa-road" },
        { id: "fa-rocket", text: "fa-rocket" },
        { id: "fa-rss", text: "fa-rss" },
        { id: "fa-rss-square", text: "fa-rss-square" },
        { id: "fa-search", text: "fa-search" },
        { id: "fa-search-minus", text: "fa-search-minus" },
        { id: "fa-search-plus", text: "fa-search-plus" },
        { id: "fa-send", text: "fa-send" },
        { id: "fa-send-o", text: "fa-send-o" },
        { id: "fa-share", text: "fa-share" },
        { id: "fa-share-alt", text: "fa-share-alt" },
        { id: "fa-share-alt-square", text: "fa-share-alt-square" },
        { id: "fa-share-square", text: "fa-share-square" },
        { id: "fa-share-square-o", text: "fa-share-square-o" },
        { id: "fa-shield", text: "fa-shield" },
        { id: "fa-shopping-cart", text: "fa-shopping-cart" },
        { id: "fa-sign-in", text: "fa-sign-in" },
        { id: "fa-sign-out", text: "fa-sign-out" },
        { id: "fa-signal", text: "fa-signal" },
        { id: "fa-sitemap", text: "fa-sitemap" },
        { id: "fa-sliders", text: "fa-sliders" },
        { id: "fa-smile-o", text: "fa-smile-o" },
        { id: "fa-sort", text: "fa-sort" },
        { id: "fa-sort-alpha-asc", text: "fa-sort-alpha-asc" },
        { id: "fa-sort-alpha-desc", text: "fa-sort-alpha-desc" },
        { id: "fa-sort-amount-asc", text: "fa-sort-amount-asc" },
        { id: "fa-sort-amount-desc", text: "fa-sort-amount-desc" },
        { id: "fa-sort-asc", text: "fa-sort-asc" },
        { id: "fa-sort-desc", text: "fa-sort-desc" },
        { id: "fa-sort-down", text: "fa-sort-down" },
        { id: "fa-sort-numeric-asc", text: "fa-sort-numeric-asc" },
        { id: "fa-sort-numeric-desc", text: "fa-sort-numeric-desc" },
        { id: "fa-sort-up", text: "fa-sort-up" },
        { id: "fa-space-shuttle", text: "fa-space-shuttle" },
        { id: "fa-spinner", text: "fa-spinner" },
        { id: "fa-spoon", text: "fa-spoon" },
        { id: "fa-square", text: "fa-square" },
        { id: "fa-square-o", text: "fa-square-o" },
        { id: "fa-star", text: "fa-star" },
        { id: "fa-star-half", text: "fa-star-half" },
        { id: "fa-star-half-empty", text: "fa-star-half-empty" },
        { id: "fa-star-half-full", text: "fa-star-half-full" },
        { id: "fa-star-half-o", text: "fa-star-half-o" },
        { id: "fa-star-o", text: "fa-star-o" },
        { id: "fa-suitcase", text: "fa-suitcase" },
        { id: "fa-sun-o", text: "fa-sun-o" },
        { id: "fa-support", text: "fa-support" },
        { id: "fa-tablet", text: "fa-tablet" },
        { id: "fa-tachometer", text: "fa-tachometer" },
        { id: "fa-tag", text: "fa-tag" },
        { id: "fa-tags", text: "fa-tags" },
        { id: "fa-tasks", text: "fa-tasks" },
        { id: "fa-taxi", text: "fa-taxi" },
        { id: "fa-terminal", text: "fa-terminal" },
        { id: "fa-thumb-tack", text: "fa-thumb-tack" },
        { id: "fa-thumbs-down", text: "fa-thumbs-down" },
        { id: "fa-thumbs-o-down", text: "fa-thumbs-o-down" },
        { id: "fa-thumbs-o-up", text: "fa-thumbs-o-up" },
        { id: "fa-thumbs-up", text: "fa-thumbs-up" },
        { id: "fa-ticket", text: "fa-ticket" },
        { id: "fa-times", text: "fa-times" },
        { id: "fa-times-circle", text: "fa-times-circle" },
        { id: "fa-times-circle-o", text: "fa-times-circle-o" },
        { id: "fa-tint", text: "fa-tint" },
        { id: "fa-toggle-down", text: "fa-toggle-down" },
        { id: "fa-toggle-left", text: "fa-toggle-left" },
        { id: "fa-toggle-right", text: "fa-toggle-right" },
        { id: "fa-toggle-up", text: "fa-toggle-up" },
        { id: "fa-trash-o", text: "fa-trash-o" },
        { id: "fa-tree", text: "fa-tree" },
        { id: "fa-trophy", text: "fa-trophy" },
        { id: "fa-truck", text: "fa-truck" },
        { id: "fa-umbrella", text: "fa-umbrella" },
        { id: "fa-university", text: "fa-university" },
        { id: "fa-unlock", text: "fa-unlock" },
        { id: "fa-unlock-alt", text: "fa-unlock-alt" },
        { id: "fa-unsorted", text: "fa-unsorted" },
        { id: "fa-upload", text: "fa-upload" },
        { id: "fa-user", text: "fa-user" },
        { id: "fa-users", text: "fa-users" },
        { id: "fa-video-camera", text: "fa-video-camera" },
        { id: "fa-volume-down", text: "fa-volume-down" },
        { id: "fa-volume-off", text: "fa-volume-off" },
        { id: "fa-volume-up", text: "fa-volume-up" },
        { id: "fa-warning", text: "fa-warning" },
        { id: "fa-wheelchair", text: "fa-wheelchair" },
        { id: "fa-wrench", text: "fa-wrench" }
      ] },
      { text: "【文件类型图标】", children: [
        { id: "fa-file", text: "fa-file" },
        { id: "fa-file-archive-o", text: "fa-file-archive-o" },
        { id: "fa-file-audio-o", text: "fa-file-audio-o" },
        { id: "fa-file-code-o", text: "fa-file-code-o" },
        { id: "fa-file-excel-o", text: "fa-file-excel-o" },
        { id: "fa-file-image-o", text: "fa-file-image-o" },
        { id: "fa-file-movie-o", text: "fa-file-movie-o" },
        { id: "fa-file-o", text: "fa-file-o" },
        { id: "fa-file-pdf-o", text: "fa-file-pdf-o" },
        { id: "fa-file-photo-o", text: "fa-file-photo-o" },
        { id: "fa-file-picture-o", text: "fa-file-picture-o" },
        { id: "fa-file-powerpoint-o", text: "fa-file-powerpoint-o" },
        { id: "fa-file-sound-o", text: "fa-file-sound-o" },
        { id: "fa-file-text", text: "fa-file-text" },
        { id: "fa-file-text-o", text: "fa-file-text-o" },
        { id: "fa-file-video-o", text: "fa-file-video-o" },
        { id: "fa-file-word-o", text: "fa-file-word-o" },
        { id: "fa-file-zip-o", text: "fa-file-zip-o" }
      ] },
      { text: "【旋转动画类图标】", children: [
        { id: "fa-circle-o-notch fa-spin", text: "fa-circle-o-notch fa-spin" },
        { id: "fa-cog fa-spin", text: "fa-cog fa-spin" },
        { id: "fa-gear fa-spin", text: "fa-gear fa-spin" },
        { id: "fa-refresh fa-spin", text: "fa-refresh fa-spin" },
        { id: "fa-spinner fa-spin", text: "fa-spinner fa-spin" }
      ] },
      { text: "【表单控件图标】", children: [
        { id: "fa-check-square", text: "fa-check-square" },
        { id: "fa-check-square-o", text: "fa-check-square-o" },
        { id: "fa-circle", text: "fa-circle" },
        { id: "fa-circle-o", text: "fa-circle-o" },
        { id: "fa-dot-circle-o", text: "fa-dot-circle-o" },
        { id: "fa-minus-square", text: "fa-minus-square" },
        { id: "fa-minus-square-o", text: "fa-minus-square-o" },
        { id: "fa-plus-square", text: "fa-plus-square" },
        { id: "fa-plus-square-o", text: "fa-plus-square-o" },
        { id: "fa-square", text: "fa-square" },
        { id: "fa-square-o", text: "fa-square-o" }
      ] },
      { text: "【货币种类图标】", children: [
        { id: "fa-bitcoin", text: "fa-bitcoin" },
        { id: "fa-btc", text: "fa-btc" },
        { id: "fa-cny", text: "fa-cny" },
        { id: "fa-dollar", text: "fa-dollar" },
        { id: "fa-eur", text: "fa-eur" },
        { id: "fa-euro", text: "fa-euro" },
        { id: "fa-gbp", text: "fa-gbp" },
        { id: "fa-inr", text: "fa-inr" },
        { id: "fa-jpy", text: "fa-jpy" },
        { id: "fa-krw", text: "fa-krw" },
        { id: "fa-money", text: "fa-money" },
        { id: "fa-rmb", text: "fa-rmb" },
        { id: "fa-rouble", text: "fa-rouble" },
        { id: "fa-rub", text: "fa-rub" },
        { id: "fa-ruble", text: "fa-ruble" },
        { id: "fa-rupee", text: "fa-rupee" },
        { id: "fa-try", text: "fa-try" },
        { id: "fa-turkish-lira", text: "fa-turkish-lira" },
        { id: "fa-usd", text: "fa-usd" },
        { id: "fa-won", text: "fa-won" },
        { id: "fa-yen", text: "fa-yen" }
      ] },
      { text: "【文本编辑类图标】", children: [
        { id: "fa-align-center", text: "fa-align-center" },
        { id: "fa-align-justify", text: "fa-align-justify" },
        { id: "fa-align-left", text: "fa-align-left" },
        { id: "fa-align-right", text: "fa-align-right" },
        { id: "fa-bold", text: "fa-bold" },
        { id: "fa-chain", text: "fa-chain" },
        { id: "fa-chain-broken", text: "fa-chain-broken" },
        { id: "fa-clipboard", text: "fa-clipboard" },
        { id: "fa-columns", text: "fa-columns" },
        { id: "fa-copy", text: "fa-copy" },
        { id: "fa-cut", text: "fa-cut" },
        { id: "fa-dedent", text: "fa-dedent" },
        { id: "fa-eraser", text: "fa-eraser" },
        { id: "fa-file", text: "fa-file" },
        { id: "fa-file-o", text: "fa-file-o" },
        { id: "fa-file-text", text: "fa-file-text" },
        { id: "fa-file-text-o", text: "fa-file-text-o" },
        { id: "fa-files-o", text: "fa-files-o" },
        { id: "fa-floppy-o", text: "fa-floppy-o" },
        { id: "fa-font", text: "fa-font" },
        { id: "fa-header", text: "fa-header" },
        { id: "fa-indent", text: "fa-indent" },
        { id: "fa-italic", text: "fa-italic" },
        { id: "fa-link", text: "fa-link" },
        { id: "fa-list", text: "fa-list" },
        { id: "fa-list-alt", text: "fa-list-alt" },
        { id: "fa-list-ol", text: "fa-list-ol" },
        { id: "fa-list-ul", text: "fa-list-ul" },
        { id: "fa-outdent", text: "fa-outdent" },
        { id: "fa-paperclip", text: "fa-paperclip" },
        { id: "fa-paragraph", text: "fa-paragraph" },
        { id: "fa-paste", text: "fa-paste" },
        { id: "fa-repeat", text: "fa-repeat" },
        { id: "fa-rotate-left", text: "fa-rotate-left" },
        { id: "fa-rotate-right", text: "fa-rotate-right" },
        { id: "fa-save", text: "fa-save" },
        { id: "fa-scissors", text: "fa-scissors" },
        { id: "fa-strikethrough", text: "fa-strikethrough" },
        { id: "fa-subscript", text: "fa-subscript" },
        { id: "fa-superscript", text: "fa-superscript" },
        { id: "fa-table", text: "fa-table" },
        { id: "fa-text-height", text: "fa-text-height" },
        { id: "fa-text-width", text: "fa-text-width" },
        { id: "fa-th", text: "fa-th" },
        { id: "fa-th-large", text: "fa-th-large" },
        { id: "fa-th-list", text: "fa-th-list" },
        { id: "fa-underline", text: "fa-underline" },
        { id: "fa-undo", text: "fa-undo" },
        { id: "fa-unlink", text: "fa-unlink" }
      ] },
      { text: "【方向类图标】", children: [
        { id: "fa-angle-double-down", text: "fa-angle-double-down" },
        { id: "fa-angle-double-left", text: "fa-angle-double-left" },
        { id: "fa-angle-double-right", text: "fa-angle-double-right" },
        { id: "fa-angle-double-up", text: "fa-angle-double-up" },
        { id: "fa-angle-down", text: "fa-angle-down" },
        { id: "fa-angle-left", text: "fa-angle-left" },
        { id: "fa-angle-right", text: "fa-angle-right" },
        { id: "fa-angle-up", text: "fa-angle-up" },
        { id: "fa-arrow-circle-down", text: "fa-arrow-circle-down" },
        { id: "fa-arrow-circle-left", text: "fa-arrow-circle-left" },
        { id: "fa-arrow-circle-o-down", text: "fa-arrow-circle-o-down" },
        { id: "fa-arrow-circle-o-left", text: "fa-arrow-circle-o-left" },
        { id: "fa-arrow-circle-o-right", text: "fa-arrow-circle-o-right" },
        { id: "fa-arrow-circle-o-up", text: "fa-arrow-circle-o-up" },
        { id: "fa-arrow-circle-right", text: "fa-arrow-circle-right" },
        { id: "fa-arrow-circle-up", text: "fa-arrow-circle-up" },
        { id: "fa-arrow-down", text: "fa-arrow-down" },
        { id: "fa-arrow-left", text: "fa-arrow-left" },
        { id: "fa-arrow-right", text: "fa-arrow-right" },
        { id: "fa-arrow-up", text: "fa-arrow-up" },
        { id: "fa-arrows", text: "fa-arrows" },
        { id: "fa-arrows-alt", text: "fa-arrows-alt" },
        { id: "fa-arrows-h", text: "fa-arrows-h" },
        { id: "fa-arrows-v", text: "fa-arrows-v" },
        { id: "fa-caret-down", text: "fa-caret-down" },
        { id: "fa-caret-left", text: "fa-caret-left" },
        { id: "fa-caret-right", text: "fa-caret-right" },
        { id: "fa-caret-square-o-down", text: "fa-caret-square-o-down" },
        { id: "fa-caret-square-o-left", text: "fa-caret-square-o-left" },
        { id: "fa-caret-square-o-right", text: "fa-caret-square-o-right" },
        { id: "fa-caret-square-o-up", text: "fa-caret-square-o-up" },
        { id: "fa-caret-up", text: "fa-caret-up" },
        { id: "fa-chevron-circle-down", text: "fa-chevron-circle-down" },
        { id: "fa-chevron-circle-left", text: "fa-chevron-circle-left" },
        { id: "fa-chevron-circle-right", text: "fa-chevron-circle-right" },
        { id: "fa-chevron-circle-up", text: "fa-chevron-circle-up" },
        { id: "fa-chevron-down", text: "fa-chevron-down" },
        { id: "fa-chevron-left", text: "fa-chevron-left" },
        { id: "fa-chevron-right", text: "fa-chevron-right" },
        { id: "fa-chevron-up", text: "fa-chevron-up" },
        { id: "fa-hand-o-down", text: "fa-hand-o-down" },
        { id: "fa-hand-o-left", text: "fa-hand-o-left" },
        { id: "fa-hand-o-right", text: "fa-hand-o-right" },
        { id: "fa-hand-o-up", text: "fa-hand-o-up" },
        { id: "fa-long-arrow-down", text: "fa-long-arrow-down" },
        { id: "fa-long-arrow-left", text: "fa-long-arrow-left" },
        { id: "fa-long-arrow-right", text: "fa-long-arrow-right" },
        { id: "fa-long-arrow-up", text: "fa-long-arrow-up" },
        { id: "fa-toggle-down", text: "fa-toggle-down" },
        { id: "fa-toggle-left", text: "fa-toggle-left" },
        { id: "fa-toggle-right", text: "fa-toggle-right" },
        { id: "fa-toggle-up", text: "fa-toggle-up" }
      ] },
      { text: "【视频播放类图标】", children: [
        { id: "fa-arrows-alt", text: "fa-arrows-alt" },
        { id: "fa-backward", text: "fa-backward" },
        { id: "fa-compress", text: "fa-compress" },
        { id: "fa-eject", text: "fa-eject" },
        { id: "fa-expand", text: "fa-expand" },
        { id: "fa-fast-backward", text: "fa-fast-backward" },
        { id: "fa-fast-forward", text: "fa-fast-forward" },
        { id: "fa-forward", text: "fa-forward" },
        { id: "fa-pause", text: "fa-pause" },
        { id: "fa-play", text: "fa-play" },
        { id: "fa-play-circle", text: "fa-play-circle" },
        { id: "fa-play-circle-o", text: "fa-play-circle-o" },
        { id: "fa-step-backward", text: "fa-step-backward" },
        { id: "fa-step-forward", text: "fa-step-forward" },
        { id: "fa-stop", text: "fa-stop" },
        { id: "fa-youtube-play", text: "fa-youtube-play" }
      ] },
      { text: "【商标类图标】", children: [
        { id: "fa-adn", text: "fa-adn" },
        { id: "fa-android", text: "fa-android" },
        { id: "fa-apple", text: "fa-apple" },
        { id: "fa-behance", text: "fa-behance" },
        { id: "fa-behance-square", text: "fa-behance-square" },
        { id: "fa-bitbucket", text: "fa-bitbucket" },
        { id: "fa-bitbucket-square", text: "fa-bitbucket-square" },
        { id: "fa-bitcoin", text: "fa-bitcoin" },
        { id: "fa-btc", text: "fa-btc" },
        { id: "fa-codepen", text: "fa-codepen" },
        { id: "fa-css3", text: "fa-css3" },
        { id: "fa-delicious", text: "fa-delicious" },
        { id: "fa-deviantart", text: "fa-deviantart" },
        { id: "fa-digg", text: "fa-digg" },
        { id: "fa-dribbble", text: "fa-dribbble" },
        { id: "fa-dropbox", text: "fa-dropbox" },
        { id: "fa-drupal", text: "fa-drupal" },
        { id: "fa-empire", text: "fa-empire" },
        { id: "fa-facebook", text: "fa-facebook" },
        { id: "fa-facebook-square", text: "fa-facebook-square" },
        { id: "fa-flickr", text: "fa-flickr" },
        { id: "fa-foursquare", text: "fa-foursquare" },
        { id: "fa-ge", text: "fa-ge" },
        { id: "fa-git", text: "fa-git" },
        { id: "fa-git-square", text: "fa-git-square" },
        { id: "fa-github", text: "fa-github" },
        { id: "fa-github-alt", text: "fa-github-alt" },
        { id: "fa-github-square", text: "fa-github-square" },
        { id: "fa-gittip", text: "fa-gittip" },
        { id: "fa-google", text: "fa-google" },
        { id: "fa-google-plus", text: "fa-google-plus" },
        { id: "fa-google-plus-square", text: "fa-google-plus-square" },
        { id: "fa-hacker-news", text: "fa-hacker-news" },
        { id: "fa-html5", text: "fa-html5" },
        { id: "fa-instagram", text: "fa-instagram" },
        { id: "fa-joomla", text: "fa-joomla" },
        { id: "fa-jsfiddle", text: "fa-jsfiddle" },
        { id: "fa-linkedin", text: "fa-linkedin" },
        { id: "fa-linkedin-square", text: "fa-linkedin-square" },
        { id: "fa-linux", text: "fa-linux" },
        { id: "fa-maxcdn", text: "fa-maxcdn" },
        { id: "fa-openid", text: "fa-openid" },
        { id: "fa-pagelines", text: "fa-pagelines" },
        { id: "fa-pied-piper", text: "fa-pied-piper" },
        { id: "fa-pied-piper-alt", text: "fa-pied-piper-alt" },
        { id: "fa-pied-piper-square", text: "fa-pied-piper-square" },
        { id: "fa-pinterest", text: "fa-pinterest" },
        { id: "fa-pinterest-square", text: "fa-pinterest-square" },
        { id: "fa-qq", text: "fa-qq" },
        { id: "fa-ra", text: "fa-ra" },
        { id: "fa-rebel", text: "fa-rebel" },
        { id: "fa-reddit", text: "fa-reddit" },
        { id: "fa-reddit-square", text: "fa-reddit-square" },
        { id: "fa-renren", text: "fa-renren" },
        { id: "fa-share-alt", text: "fa-share-alt" },
        { id: "fa-share-alt-square", text: "fa-share-alt-square" },
        { id: "fa-skype", text: "fa-skype" },
        { id: "fa-slack", text: "fa-slack" },
        { id: "fa-soundcloud", text: "fa-soundcloud" },
        { id: "fa-spotify", text: "fa-spotify" },
        { id: "fa-stack-exchange", text: "fa-stack-exchange" },
        { id: "fa-stack-overflow", text: "fa-stack-overflow" },
        { id: "fa-steam", text: "fa-steam" },
        { id: "fa-steam-square", text: "fa-steam-square" },
        { id: "fa-stumbleupon", text: "fa-stumbleupon" },
        { id: "fa-stumbleupon-circle", text: "fa-stumbleupon-circle" },
        { id: "fa-tencent-weibo", text: "fa-tencent-weibo" },
        { id: "fa-trello", text: "fa-trello" },
        { id: "fa-tumblr", text: "fa-tumblr" },
        { id: "fa-tumblr-square", text: "fa-tumblr-square" },
        { id: "fa-twitter", text: "fa-twitter" },
        { id: "fa-twitter-square", text: "fa-twitter-square" },
        { id: "fa-vimeo-square", text: "fa-vimeo-square" },
        { id: "fa-vine", text: "fa-vine" },
        { id: "fa-vk", text: "fa-vk" },
        { id: "fa-wechat", text: "fa-wechat" },
        { id: "fa-weibo", text: "fa-weibo" },
        { id: "fa-weixin", text: "fa-weixin" },
        { id: "fa-windows", text: "fa-windows" },
        { id: "fa-wordpress", text: "fa-wordpress" },
        { id: "fa-xing", text: "fa-xing" },
        { id: "fa-xing-square", text: "fa-xing-square" },
        { id: "fa-yahoo", text: "fa-yahoo" },
        { id: "fa-youtube", text: "fa-youtube" },
        { id: "fa-youtube-play", text: "fa-youtube-play" },
        { id: "fa-youtube-square", text: "fa-youtube-square" }
      ] },
      { text: "【医疗类图标】", children: [
        { id: "fa-ambulance", text: "fa-ambulance" },
        { id: "fa-h-square", text: "fa-h-square" },
        { id: "fa-hospital-o", text: "fa-hospital-o" },
        { id: "fa-medkit", text: "fa-medkit" },
        { id: "fa-plus-square", text: "fa-plus-square" },
        { id: "fa-stethoscope", text: "fa-stethoscope" },
        { id: "fa-user-md", text: "fa-user-md" },
        { id: "fa-wheelchair", text: "fa-wheelchair" }
      ] }
    ];
    var defaults = {
      placeholder: "查找...", //默认显示的文本
      allowClear: true, //选择后出现清除按钮图标
      formatResult: function(item){return '<i class=\"fa fa-fw fa-lg ' + item.text + '\"></i> ' + item.text;},
      formatSelection: function(item){return '<i class=\"fa fa-fw fa-lg ' + item.text + '\"></i> ' + item.text;},
      data: icons //指定数据源
    };
    var opt = $.extend(true, {}, defaults, options);
    el.select2(opt);
  }
};
/** =====================storage 本地存储 */
zy.cache = {
  /**
   * get 获取存储对象
   *     zy.cache.get('_mdm_dict', 'ls');
   * @param {String} name 缓存的名字空间
   * @param {String} type 缓存类型(ls:localStorage, ss:sessionStorage, cs:cookieStorage)
   * @return {Object} 缓存对象
   */
  get: function (name, type) {
    /**
     * Set an item in a storage.
     * zy.cache.ls.set('foo','value') // Set storage.foo to "value"
     * zy.cache.ls.set('foo.foo2.foo3...','value') // Set storage.foo.foo2.foo3... to "value"
     * zy.cache.ls.set('foo','foo2','foo3'...,'value') // Set storage.foo.foo2.foo3... to "value"
     * zy.cache.ls.set({'foo':'value,'foo2':'value2'}) // Set storage.foo to "value" and storage.foo2 to "value2"
     *
     * If argument is an object, set() set value on storage for each property of this object.
     */
    /**
     * Get an item from a zy.cache.
     * zy.cache.ls.get('foo') // Return storage.foo
     * zy.cache.ls.get('foo.foo2.foo3...') // Return storage.foo.foo2.foo3...
     * zy.cache.ls.get('foo','foo2','foo3'...) // Return storage.foo.foo2.foo3...
     * zy.cache.ls.get(['foo','foo2']) // Return {foo:storage.foo,foo2:storage.foo2}
     *
     * @return {Object} return an object with value for each item of this array.
     */
    // 构建此HOST名字空间的存储对象
    var ns = $.initNamespaceStorage(zy.ui.browser.getHost() + name);
    switch (type) {
      case 'ls':
        return ns.localStorage; // Namespace in localStorage
        break;
      case 'ss':
        return ns.sessionStorage; // Namespace in sessionStorage
        break;
      case 'cs':
        return ns.cookieStorage; // Namespace in cookieStorage (only if jquery.cookie added)
    }
  },

  /**
   * initDicts 调用共通方法：通过类别查找缓存数据是否存在，当此类别缓存数据不存在调用ajax获取并存储到缓存中。
   * @param {String} keys 数据字典类别(含TableName):多项以 , 分割字符串，如：'typeA,typeB,typeC'
   * @param {Function} cb 回调函数
   * @return {Function} 回调函数
   */
  initDicts: function (keys, cb) {
    var arr = keys.split(',');
    var str = '';
    for(var i in arr){
      var ls = zy.cache.get('_mdm_dict', 'ls');
      if (!ls.isSet(arr[i]) || ls.isEmpty(arr[i])) {
        zy.log("cache === false");
        str += arr[i] + ',';
      }
    }
    
    if (str !== '') {
      str = str.trimCom();
      zy.g.am.app = 'ZYAPP_LOGIN';
      zy.g.am.mod = 'ZYMODULE_LOGIN';
      var getDict = new zyNet();
      getDict.get("api/getdict", function(msg){
        if(msg && msg.result && msg.result.length > 0){
          var result = msg.result;
          $.each(result,function(i,v){
            $.each(v,function(ii,vv){
              ls.set(ii, vv);
            })
          });
          return cb();
        }else{
          return cb();
        }
      }, { typecd:str }, null, null);
    } else {
      return cb();
    }
  },
  refreshData : function(keys,cb) {
    var str = keys.trimCom();
    var ls = zy.cache.get('_mdm_dict', 'ls');
    ls.removeall();
    var callback = function(msg) {
        if(msg && msg.result && msg.result.length > 0){
          var result = msg.result;
          $.each(result,function(i,v){
            $.each(v,function(ii,vv){
              ls.set(ii, vv);
            })
          });
        }
        return cb();
    };
    zy.g.am.app = 'ZYAPP_LOGIN';
    zy.g.am.mod = 'ZYMODULE_LOGIN';
    var getDict = new zyNet();
    getDict.get("api/getdict", callback, { typecd : str }, null, null);
  },
  /**
   * 字典翻转
   *
   * @method cd2name
   * @param {String} type 数据字典类别
   * @param {String} cd 字典Code
   * @return {String} 字典名称
   */
  cd2name: function (type, cd) {
    var ls = zy.cache.get('_mdm_dict', 'ls');
    if (ls.isSet(type) && !ls.isEmpty(type)) {
      zy.log("type [=] " + type);
      var list = ls.get(type);
      for (var i in list) {
        if (list[i].id === cd)
          return list[i].name;
      }
    }
    return '';
  },
  name2cd:function (type, name) {
    var ls = zy.cache.get('_mdm_dict', 'ls');
    if (ls.isSet(type) && !ls.isEmpty(type)) {
      zy.log("type [=] " + type);
      var list = ls.get(type);
      for (var i in list) {
        if (list[i].name === name)
          return list[i].id;
      }
    }
    return '';
  }
};

/** =====================扩展功能 */
/** 在原生String对象基础上添加自定义函数，如：字符串处理工具常用API,包括空白处理、字符统计、字符容器等. */
/**
 * 去掉字符串前面和最后的空格
 *
 * @method trim
 * @return {String}
 */
String.prototype.trim = function () {
  return this.replace(/(^\s*)|(\s*$)/g, "");
};
/**
 * 去掉字符串中所有的空格
 *
 * @method trimBlanks
 * @return {String}
 */
String.prototype.trimBlanks = function () {
  return this.replace(/(\s*)/g, "");
};
/**
 * 去掉字符串前面(prefix)的空格blank
 *
 * @method trimPreBlank
 * @return {String}
 */
String.prototype.trimPreBlank = function () {
  return this.replace(/(^\s*)/g, "");
};
/**
 * 去掉字符串后面(suffix)的空格blank
 *
 * @method trimSufBlank
 * @return {String}
 */
String.prototype.trimSufBlank = function () {
  return this.replace(/(\s*$)/g, "");
};
/**
 * 去掉字符串中所有的character
 *
 * @method trimChars
 * @param {String/Number} character 字符
 * @param {Boolean} caseSensitive [optional,default=false] 是否区分大小写
 * @return {String}
 */
String.prototype.trimChars = function (character, caseSensitive) {
  if (character === '') {
    character = ' ';
  }
  var i = 'i';
  if (caseSensitive) {
    i = '';
  }
  return this.replace(new RegExp("(" + character + ")", i + "g"), "");
};
/**
 * 去掉字符串最后面的','end//[逗号Comma]
 *
 * @method trimCom
 * @return {String}
 */
String.prototype.trimCom = function () {
  return this.replace(/(\,$)/g, "");
};
/**
 * 去掉字符串中前面的'0'
 *
 * @method trimZero
 * @return {String}
 */
String.prototype.trimPreZero = function () {
  return this.replace(/(^0*)/g, "");
};
/**
 * 计算字符串的长度（一个双字节字符按UTF-8长度计3(aaa)，ASCII字符计1）
 *
 * @method sizeUTF8
 * @return {String}
 */
String.prototype.sizeUTF8 = function () {
  return this.replace(/[^\x00-\xff]/g, "aaa").length;
};
/**
 * 计算字符串的长度（一个双字节字符按DWORD长度计2(aa)，ASCII字符计1）
 *
 * @method sizeDW
 * @return {String}
 */
String.prototype.sizeDW = function () {
  return this.replace(/[^\x00-\xff]/g, "aa").length;
};
/**
 * 清除前面和后面的换行符
 *
 * @method trimLines
 * @return {String}
 */
String.prototype.trimLines = function () {
  return this.replace(/(^\n+)|(\n+$)/g, "");
};
/**
 * 将多个换行替换为一个
 *
 * @method rowSpan
 * @return {String}
 */
String.prototype.rowSpan = function () {
  return this.replace(/(\n+)/g, "\n");
};
/**
 * 将\n替换为\r\n<br>
 * 在windows系统下，回车换行符号是"\r\n".但是在Linux等系统下是"\n"符号
 *
 * @method lr2crlf
 * @return {String}
 */
String.prototype.lf2crlf = function () {
  return this.replace(/(\n+)/g, "\r\n");
};
/**
 * 格式化字符串,将{n},替换为对应的参数，如：'I {0}&{1} China.'.formatArgs('love','like'); 输出："I
 * love&like China."
 *
 * @method formatArgs
 * @param {String/Number} arguments
 * @return {String}
 */
String.prototype.formatArgs = function () {
  var thiz = this;
  for (var i = 0; i < arguments.length; i++) {
    var param = "\{" + i + "\}";
    thiz = thiz.replace(param, arguments[i]);
  }
  return thiz;
};
/**
 * 日期格式化函数
 * @method String.toDate
 * 日期格式字符串，如："2012-9-20 19:46:18"
 * @return {Date} 返回日期类型数据
 */
String.prototype.toDate = function () {
  if (this && typeof this === "string") {
    return new Date(this.replace(/\-/g, '/'));
  }
  //  return eval('new Date(' + this.replace(/\d+(?=-[^-]+$)/, function (a) {
  //    return parseInt(a, 10) - 1;
  //  }).match(/\d+/g) + ')');
};
/**
 * 日期格式化函数
 * @method Date.toFormat
 * @param arguments {String} str 格式字符串
      YYYY|yyyy|YY|yy 表示年份
      q 表示季度
      M|M 月份
      W|w 星期
      dd|DD|d|D 日期
      hh|HH|h|H 时间
      mm|m 分钟
      ss|SS|s|S 秒
 * @return {String} 格式化后的日期字符串
 */
Date.prototype.toFormat = function (str) {
  if (!str)
    return;
  var o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "h+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S": this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(str))
    str = str.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(str))
      str = str.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return str;
};
/**
 * 对Date的扩展，将 Date 转化为指定格式的String * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q)
    可以用 1-2 个占位符 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) * eg: * (new
    Date()).pattern("yyyy-MM-dd hh:mm:ss.S")==> 2006-07-02 08:09:04.423
 * (new Date()).pattern("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 二 20:09:04
 * (new Date()).pattern("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04
 * (new Date()).pattern("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04
 * (new Date()).pattern("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18
 */
Date.prototype.format = function (str) {
  var o = {
    "M+": this.getMonth() + 1,
    //月份
    "d+": this.getDate(),
    //日
    "h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12,
    //小时
    "H+": this.getHours(),
    //小时
    "m+": this.getMinutes(),
    //分
    "s+": this.getSeconds(),
    //秒
    "q+": Math.floor((this.getMonth() + 3) / 3),
    //季度
    "S": this.getMilliseconds() //毫秒
  };
  var week = {
    "0": "/u65e5",
    "1": "/u4e00",
    "2": "/u4e8c",
    "3": "/u4e09",
    "4": "/u56db",
    "5": "/u4e94",
    "6": "/u516d"
  };
  if (/(y+)/.test(str)) {
    str = str.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  if (/(E+)/.test(str)) {
    str = str.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[this.getDay() + ""]);
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      str = str.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
  }
  return str;
};
/**
 * 判断数据中是否存在cell值，并返回第一个存在的位置
 *
 * @method indexOf
 * @param {String/Number} cell 数组元素值
 * @returns {Number} 查询成功返回0-n的索引号，失败返回-1
 */
Array.prototype.indexOf = function (cell) {
  for (var i = 0, len = this.length; i < len; i++) {
    if (this[i] === cell)
      return i;
  }
  return -1;
};
/*---IE Extend---*/
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (elt /* , from */ ) {
    var len = this.length >>> 0;

    var from = Number(arguments[1]) || 0;
    from = (from < 0) ? Math.ceil(from) : Math.floor(from);
    if (from < 0)
      from += len;

    for (; from < len; from++) {
      if (from in this && this[from] === elt)
        return from;
    }
    return -1;
  };
}

/** =====================FORM 表单对象功能扩展 */
/**
 * json对象绑定到form表单中
 * @method json2form 将函数注册到jQuery对象
 * @param {Object} json 对象
 */
$.fn.json2form = function (json) {
  //  return zy.ui.form.deserializeSimple($(this), json);
  return zy.ui.form.deserialize($(this), json);
};
$.fn.jsons2form = function (json) {
  return zy.ui.form.deserialize($(this), json);
};
$.fn.form2json = function () {
  return zy.ui.form.serialize($(this));
};
/* {String} type 数据字典类别, {Boolean} flg 追加全部选项, {Object} options 参数 */
$.fn.zySelect = function (type, flg, options) {
  return zy.ui.Select2.Set(type, $(this), flg, options);
};
/* {String} type 数据字典类别, {Boolean} flg 追加全部选项, {Object} options 参数, {Object} customData 自定义绑定数据 */
$.fn.zySelectCustomData = function (type, flg, options, customData) {
  return zy.ui.Select2.SetCustomData(type, $(this), flg, options, customData);
};
/* 图标选择 {Object} options 参数 */
$.fn.zySelectIcons = function (options) {
  return zy.ui.Select2.Icons($(this), options);
};

/**
 * 输入框添加智能auto-complete功能
 * {String} type 数据字典类别
 */
$.fn.zyAuto = function (type) {
  var ls = zy.cache.get('_mdm_dict', 'ls');
  zy.log(JSON.stringify('auto-complete = ' + ls.get(type)));
  var substringMatcher = function(strs) {
    return function findMatches(q, cb) {
      // an array that will be populated with substring matches
      var matches = [];
      // regex used to determine if a string contains the substring `q`
      var substrRegex = new RegExp(q, 'i');
      // iterate through the pool of strings and for any string that
      // contains the substring `q`, add it to the `matches` array
      $.each(strs, function(i, str) {
        if (substrRegex.test(str.text)) {
          // the typeahead jQuery plugin expects suggestions to a
          // JavaScript object, refer to typeahead docs for more info
          matches.push({ value: str.name });
        }
      });
      cb(matches);
    };
  };
  $(this).typeahead({
      hint: true,
      highlight: true,
      minLength: 1
    },
    {
      name: type,
      displayKey: 'value',
      source: substringMatcher(ls.get(type))
    });

};

/* jquery.form 扩展说明 */
/**
 * checkboxes、radio、selects 元素对象的选择或取消选择处理
 * @param {Boolean} select 参数，true 为选择（默认值），false 为取消选择
 */
//$.fn.selected = function(select);
/* Resets the form data. Causes all form elements to be reset to their original value. */
//$.fn.resetForm = function();
/**
 * Clears the form(input,select,checkbox) data.
 * - submit, button, reset, and hidden will *not* be effected
 * @param {Boolean} includeHidden 是否包含隐藏对象，true 含，false 不含
 */
//$.fn.clearForm = function (includeHidden);
/**
 * Clears the selected form elements.
 * @param {Boolean} includeHidden 是否包含隐藏对象，true 含，false 不含
 */
//$.fn.clearInputs = function (includeHidden);
/**
 * 禁用/启用输入控件。
 *
 * @method formDisable
 * @param {Boolean} disabled true 禁用，false 启用
 * @param {String} names 可选参数, 元素：name1, name2, name3,...
 */
$.fn.formDisable = function (disabled, names) {
  if (names) {
    var nArr = names.split(',');
    for (var i in nArr) {
      var element = nArr[i];
      if (disabled) {
         this.find('input[name="' + element + '"],select[name="' + element + '"],textarea[name="' + element + '"],button[name="' + element + '"],submit[name="' + element + '"]').attr('disabled', disabled).parent().addClass('state-disabled');
      } else {
         this.find('input[name="' + element + '"],select[name="' + element + '"],textarea[name="' + element + '"],button[name="' + element + '"],submit[name="' + element + '"]').attr('disabled', disabled).parent().removeClass('state-disabled');
      }
    }
  } else {
    if (disabled) {
      this.find('input,select,textarea,button,submit').attr('disabled', disabled).parent().addClass('state-disabled');
    } else {
      this.find('input,select,textarea,button,submit').attr('disabled', disabled).parent().removeClass('state-disabled');
    }
  }
  return this;
};
/**
 * 禁用/启用按钮。
 *
 * @method btnDisable
 * @param {Boolean} disabled true 禁用，false 启用
 */
$.fn.btnDisable = function (disabled) {
    if (disabled) {
      $(this).attr('disabled', disabled).parent().addClass('state-disabled');
    } else {
      $(this).attr('disabled', disabled).parent().removeClass('state-disabled');
    }
  return this;
};

/** =====================其他功能扩展 */
/**
 * 利用语法糖进行事件绑定
 * @method i_coffee 将函数注册到jQuery对象
 * @param {Object} obj params对象
 */
$.fn.i_coffee = function (obj) {
  for (var eName in obj)
    for (var selector in obj[eName])
      $(this).on(eName, selector, obj[eName][selector]);
};
window.console = window.console || {};
console.log || (console.log = typeof opera != "undefined" ? opera.postError : function (msg) {});
ConsoleUtils = (function () {
  var open = false;
  function ConsoleUtils(op) {
    open = op;
  }
  ConsoleUtils.prototype.toggle = function () {
    open = !open;
  };
  ConsoleUtils.prototype.open = function () {
    open = true;
  };
  ConsoleUtils.prototype.close = function () {
    open = false;
  };
  ConsoleUtils.prototype.log = function (msg) {
    if (open)
      console.log(msg);
  };
  return ConsoleUtils;
})();
var Console = new ConsoleUtils(false);
