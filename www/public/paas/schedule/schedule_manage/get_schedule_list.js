/**
 *计划任务管理信息
 * @class ScheduleList
 */
ScheduleList = (function() {

  var PT = ScheduleList.prototype;
  var thiz;
  var conditions;
  /**
   * 默认配置参数
   * @attribute _g
   * @private
   */
  PT._g = {
    data: [],
    param: {},
    page: 1, //开始页数
    count: 1, //总记录数
    crt_page: 1 //当前页
  };

  //表格元素对象
  var dt = $('#schedule_schedulelist_dt');

  /**
   * 事件绑定规则定义
   * @property Events
   */
  PT.Events = {};

  /**
   * @class 
   * @constructor
   */
  function ScheduleList() {
    Console.log("new ScheduleList()");
    thiz = this;
   
    thiz.Select(function(){
      thiz.Init();
    });
    return this;
  }

  /**
   * 画面初始化
   * @method init
   */
  PT.Init = function() {
    // thiz.Select();
    thiz.DataTable();
    thiz.Toolbar();
    $('#schedule_schedulelist_del').btnDisable(true);
    $('#schedule_schedulelist_edit').btnDisable(true);
    $('#schedule_schedulelist_go').btnDisable(true);
    $('#schedule_schedulelist_stop').btnDisable(true);
  };
  /*窗口改变时，重新调整画面大小*/
  function DynamicWidth() {
      $('.dataTables_scrollHeadInner').css('width', '100%');
      $('.dataTables_scrollBody table').css('width', '100%');
      $('.dataTables_scrollHeadInner table').css('width', '100%');
    }
    /**
     * 表格加载
     * @method DataTable
     * @param {Object} data 数据对象
     */
  PT.DataTable = function(data) {
    //定义绑定数据结构
    var columns = [{
      'title':'计划名称',
      "data": "schedulenm"
    }, {
      'title':'计划执行状态',
      'render':function(data, type, row, meta){
        return zy.cache.cd2name("ZR.0057", String(row.task_status));
      }
    }, {
      'title':'任务运行状态',
      "render": function(data, type, row, meta) {
        console.log(row.task_status);
        return  zy.cache.cd2name("ZR.0056", String(row.schedule_status));
      }
    }, {
      "title": "周期类型",
      "render": function(data, type, row, meta) {
        return  zy.cache.cd2name("ZR.0055", row.schedule_cycle);
      }
    }
    ];
    //预设初始化参数
    var options = {
      "data": data,
      "columns": columns
    };
    // 合并初始化参数选项
    $.extend(options, zy.ui.dataTable);
    //初始化 DataTable
    dt.dataTable(options);
    DynamicWidth();
  };
  /**
   * Toolbar 事件处理
   * @method Toolbar
   */
  PT.Toolbar = function() {
    // 单击事件
    dt.on('click', 'tr', function(e) {
      // 当前选择行 index
      Console.log('this.is("tr") = ' + $(this).find('th').is('th') + ' : ' + $(this).find('td').hasClass('dataTables_empty'));
      if ($(this).find('th').is('th') || $(this).find('td').hasClass('dataTables_empty'))
        return false;

      Console.log($(e.target).is('button') + '==== ' + $(e.target).parents("form").html());
      //【修改状态,保存按钮】事件托管
      if ($(e.target).is('button')) {
        thiz.SaveStatus($(e.target).parents("form"));
      }

      // 变换选择行状态颜色
      if (!$(this).find('div').hasClass('popover') && $(this).hasClass('active')) {
        $(this).removeClass('active');
        $('#schedule_schedulelist_del').btnDisable(true);
        $('#schedule_schedulelist_edit').btnDisable(true);
        $('#schedule_schedulelist_go').btnDisable(true);
        $('#schedule_schedulelist_stop').btnDisable(true);
      } else {
        dt.DataTable().$('tr.active').removeClass('active');
        $(this).addClass('active');
        var data = dt.DataTable().row('.active').data();
        var st = data.schedule_status;
        $('#schedule_schedulelist_edit').btnDisable(false);
        switch(st){
          case '1':
            $('#schedule_schedulelist_edit').html('&emsp;<i class="fa fa-edit"></i>&emsp;修 改&emsp;');
            $('#schedule_schedulelist_go').btnDisable(false);
            $('#schedule_schedulelist_del').btnDisable(false);
            $('#schedule_schedulelist_stop').btnDisable(true);
            break;
          case '2':
            $('#schedule_schedulelist_edit').html('&emsp;<i class="fa fa-edit"></i>&emsp;查 看&emsp;');
            $('#schedule_schedulelist_del').btnDisable(true);
            $('#schedule_schedulelist_go').btnDisable(true);
            $('#schedule_schedulelist_stop').btnDisable(false);
            break;
          case '3':
            $('#schedule_schedulelist_edit').html('&emsp;<i class="fa fa-edit"></i>&emsp;查 看&emsp;');
            $('#schedule_schedulelist_del').btnDisable(false);
            $('#schedule_schedulelist_go').btnDisable(false);
            $('#schedule_schedulelist_stop').btnDisable(true);
            break;
        }
      }
    });
    //查询
    $('#schedule_schedulelist_search').click(function() {
      conditions = $('#schedule_schedulelist_form').serialize();
      $('#schedule_schedulelist_edit').btnDisable(true);
      $('#schedule_schedulelist_del').btnDisable(true);
      $('#schedule_schedulelist_go').btnDisable(true);
      $('#schedule_schedulelist_stop').btnDisable(true);
      $('#schedule_schedulelist_search').button('loading');
      thiz.Pagination(1);
    });
    //添加
    $('#schedule_schedulelist_add').click(function() {
      zy.net.loadHTML("schedule/schedule_manage/add_updschedule.html", $("#schedule_schedulelist_form2"),function(){
        schedule_edit();
      });
    });
    //修改
    $('#schedule_schedulelist_edit').click(function() {
      // 当前选择行数据
      var data = dt.DataTable().row('.active').data();
      zy.net.loadHTML("schedule/schedule_manage/add_updschedule.html", $("#schedule_schedulelist_form2"),function(){
        // console.log(typeof date.schedule_status,date.schedule_status);
        // console.log('!!!!!',data.schedule_status);
        var flg = data.schedule_status != '1';
        // console.log(flg);
        schedule_edit(data.scheduleid,flg);
      });
    });
     //删除
    $('#schedule_schedulelist_del').click(function() {
      zy.ui.mask('删除确认', '数据删除后将不能再恢复，是否确定删除该数据？', function() {
        $('#schedule_schedulelist_form').formDisable(true);
        var data = dt.DataTable().row('.active').data();
        var param = {
          scheduleid: data.scheduleid
        };
        zy.g.am.app = 'a20a0c6a82fb4cb085cb816e5526d4bc';
        zy.g.am.mod = 'cron';
        zy.net.get('api/delete', function(msg) {
          if (msg) {
            dt.DataTable().row('.active').remove().draw();
            $('#schedule_schedulelist_del').btnDisable(true);
            thiz.Pagination(thiz._g.crt_page); //更新当前页
            zy.ui.msg("提示信息：", "删除成功！", "s");
          } else {
            zy.ui.msg('提示信息：', '删除失败', 'e');
          }
          $('#schedule_schedulelist_form').formDisable(false);
        }, param);
      });
    });
    //启动
    $('#schedule_schedulelist_go').click(function() {
      var dialog = $('<div>').html('正在执行任务...');
      dialog.attr('title','提示');
      dialog.dialog();
      // $( "#dialog" ).dialog( "open" );
      var rowIdx = dt.DataTable().row('.active').index();
      Console.log("当前选择行 = " + rowIdx);
      var data = dt.DataTable().row('.active').data();
      var t={
        scheduleid:data.scheduleid
      }
      var cb=function(msg){
        if(msg.ret==0)
        zy.ui.msg('提示信息','启动成功','s');
        dialog.dialog("close");
        thiz.Pagination(1);
      }
      zy.g.am.app = 'a20a0c6a82fb4cb085cb816e5526d4bc';
      zy.g.am.mod = 'cron';
      zy.net.get("api/starttask", cb, t,null,function(m){
        zy.ui.msg('提示信息',m.msg,'e');
        dialog.dialog("close");
      });
    });
    
    $('#schedule_schedulelist_stop').click(function(){
      var dialog = $('<div>').html('正在执行任务...');
      dialog.attr('title','提示');
      dialog.dialog();
      var rowIdx = dt.DataTable().row('.active').index();
      Console.log("当前选择行 = " + rowIdx);
      var data = dt.DataTable().row('.active').data();
      var t={
        scheduleid:data.scheduleid
      }
      var cb=function(msg){
        if(msg.ret==0)
        zy.ui.msg('提示信息','已停止','s');
        dialog.dialog( "close" );
        thiz.Pagination(1);
      }
      zy.g.am.app = 'a20a0c6a82fb4cb085cb816e5526d4bc';
      zy.g.am.mod = 'cron';
      zy.net.get("api/stoptask", cb, t, null, function(msg){
        dialog.dialog("close");
      });
      
    })

  };
  /**
   * 分页处理
   * @method Pagination
   * @param {Number} page 页码
   */
  PT.Pagination = function(page) {
    Console.log('Pagination page = ' + page);
    $.jqPaginator('#schedule_schedulelist_pagination', {
      totalCounts: thiz._g.count,
      pageSize: zy.g.page.pagesize,
      currentPage: page,
      onPageChange: function(num) {
        Console.log('onPageChange num = ' + num);
        thiz.SetDt(num);
      }
    });
  };
  /**
   * 设置表格数据
   * @method SetDt
   * @param {Number} page 页码
   */
  PT.SetDt = function(page) {
    // Console.log('SetDt page = ' + page);
    var cb = function(msg) {
      $('#schedule_schedulelist_search').button('reset');
      if (msg) {
        $('#schedule_schedulelist_edit').btnDisable(true);
        $('#schedule_schedulelist_go').btnDisable(true);
        $('#schedule_schedulelist_stop').btnDisable(true);
        thiz._g.count = msg.count; //获取总记录数
        thiz._g.data = msg.result;
        thiz.DataTable(msg.result);
        Console.log('if (msg) thiz._g.count = ' + thiz._g.count);
        if (msg.count > 0 && msg.result.length > 0) {
          $('#schedule_schedulelist_pagination').jqPaginator('option', {
            totalCounts: thiz._g.count,
            pageSize: zy.g.page.pagesize,
            currentPage: page
          });
        } else {
          thiz._g.count = 1;
          thiz._g.page = 1;
          $('#schedule_schedulelist_pagination').jqPaginator('destroy');
        }
        // DO NOT REMOVE : GLOBAL FUNCTIONS!
        pageSetUp();
      }
    };
    zy.g.am.app = 'a20a0c6a82fb4cb085cb816e5526d4bc';
    zy.g.am.mod = 'cron';
    zy.net.get("api/list", cb, conditions, page);
  };
  /**
   * 更新表格数据
   * @method UpDt
   */
  PT.UpDt = function() {
    thiz.Pagination(1);
  };
  /**
   * 设置和更新行数据
   * @method SetRow
   * @param {Object} msg 数据对象 $('#form_id').form2json()
   */
  PT.SetRow = function(msg) {
    Console.log("SetRow msg = " + JSON.stringify(msg));
    // 当前选择行数据
    var data = dt.DataTable().row('.active').data();
    Console.log("更新前的行数据 = " + JSON.stringify(data));
    // 修改数据并刷新 dataTable
    $.extend(data, msg);
    if (data.status === '1') {
      data.statusnm = '有效';
    } else {
      data.statusnm = '无效';
    }
    Console.log("更新后的行数据 = " + JSON.stringify(data));
    dt.DataTable().rows().invalidate().draw();
  };
  /**
   * 保存状态修改结果
   * @method SaveStatus
   * @param {Object} el 表单对象
   */
  PT.SaveStatus = function(el) {
    var param = {};
    var st = zy.ui.form.getRadioValue('status', el);
    // 状态值是否有变化
    if (st == el.data("status")) return;
    var cb = function(msg) {
      if (msg) {
        thiz.SetRow(param);
        $('[rel=popover]').each(function() {
          $(this).popover('hide');
        });
        zy.ui.msg('提示信息：', '保存【状态】成功！', 's');
      }
    };
    param.task_id = el.data('task_id');
    param.status = st;
    zy.g.am.app = 'a20a0c6a82fb4cb085cb816e5526d4bc';
    zy.g.am.mod = 'cron';
    zy.net.get('api/setsystemstatus', cb, param);
  };
  PT.Select = function(cbb) {
    // 数据字典处理
    var cb = function() {
      // 字典数据绑定
      $("#schedule_schedulelist_form input[name=status]").zySelect('ZR.0001', true, {
        width: '100%'
      });
      $("#schedule_schedulelist_form input[name=status]").select2('val', '1');
      cbb();
    };
    // 预处理该画面所需的字典类型，以 , 号分割
    zy.cache.initDicts('ZR.0001,ZR.0057,ZR.0055,ZR.0056', cb);
  };
  return ScheduleList;
})();
