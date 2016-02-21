var dyTable = (function (zy, $) {


  var tools = {
    api: function (param, cb) {
      var _cb = function (msg) {
        cb && cb(msg);
      };
      zy.g.am.app = param.app || 'd2c8511b47714faba5c71506a5029d94';
      zy.g.am.mod = param.mod;
      zy.net.get("api/" + param.api, _cb, param.r_param, param.page);
    },
    label: function (str) {
      var t = '<' + str + '></' + str + '>';
      return $(t)
    }
  };

  function dom() {

    this.tableC = datatablecontainer;
    this.pageC = pagenation;

    function datatablecontainer() {
      var table = tools.label('table');
      table.addClass('table table-bordered table-striped');
      return table;
    }
    function pagenation() {
      var div = tools.label('div').addClass('row');
      return div;
    }
  }

  function dyTable(apiinfo,_cb) {
    
    var thiz = null;

    function checkinfo(apiinfo) {
      if (!apiinfo)
        return zy.ui.msg('提示', '初始化失败', 'w');
      if (!apiinfo.app)
        return zy.ui.msg('提示', 'app异常', 'w');
      if (!apiinfo.api)
        return zy.ui.msg('提示', 'api异常', 'w');
      if (!apiinfo.mod)
        return zy.ui.msg('提示', 'mod异常', 'w');
      return true;
    }

    if (checkinfo(apiinfo)) {
      this.init = _init(apiinfo);
      // $.extend(true, _apiinfo, apiinfo);
      zy.cache.initDicts('ZR.0001', function(){
        _cb && _cb({
          init : _init(apiinfo)
        })
      });
    }
  }

  function clean(c) {
    c.removeClass();
    c.empty();
  }

  function _init(apiinfo) {
    var index = true;
    return function(container, param, func, onfunc,offfunc,flg){
      if (!container)
        return zy.ui.msg('提示', '缺少容器', 'w');
  
      var d = new dom();
      var tablecontainer = d.tableC();
      var pagecontainer = d.pageC();
  
      clean(container);
      clean($(container.next()[0]));
  
      container.addClass('dataTables_wrapper');
      container.append(tablecontainer);
      container.after(pagecontainer);
  
      pagenation(pagecontainer, tablecontainer, param, func,apiinfo,index,container);
  
      var e = event(tablecontainer,onfunc,offfunc,flg);
  
      return {
        setrow: e.SetRow,
        getrow: e.GetRow
      }
    }
  }

  function event(tablecontainer,onfunc,offfunc,flag) {

    tablecontainer.on('click', 'tr', function (e) {
      if ($(this).find('th').is('th') || $(this).find('td').hasClass('dataTables_empty'))
        return false;
      if (!$(this).find('div').hasClass('popover') && $(this).hasClass('active')) {
        $(this).removeClass('active');
        if(flag){
          if($(this).siblings('tr.active').length == 0){
            offfunc&&offfunc();
          }
        }else{
          offfunc&&offfunc();
        }
      } else {
        if(!flag){
          tablecontainer.DataTable().$('tr.active').removeClass('active');
          $(this).addClass('active');
           onfunc&&onfunc(tablecontainer.DataTable().row('.active').data());
        }else{
          $(this).addClass('active');
          var result = [];
          tablecontainer.find('tr.active').each(function(){
            var data = tablecontainer.DataTable().row($(this)).data();
            result.push(data);
          });
          onfunc&&onfunc(result);
        }
      }
    });

    function SetRow(msg) {
      var data = tablecontainer.DataTable().row('.active').data();
      $.extend(data, msg);
      if (data.status === '1') {
        data.statusnm = '有效';
      } else {
        data.statusnm = '无效';
      }
      tablecontainer.DataTable().rows().invalidate().draw();
    }
    
    function GetRow(){
      var data = tablecontainer.DataTable().row('.active').data();
      if(data)
        return data;
      //return zy.ui.msg('提示','请选中一行','i');
    }

    return {
      SetRow: SetRow,
      GetRow: GetRow
    }
  }

  function pagenation(pageContainer, tablecontainer,param,func,apiinfo,index,container) {
    $.jqPaginator(pageContainer, {
      totalCounts: 1,
      pageSize: zy.g.page.pagesize,
      currentPage: 1,
      onPageChange: function (num) {
        SetDt(num, pageContainer, tablecontainer, param,func,apiinfo,index,container);
      }
    });
  }

  function dyColums(_arr) {
    var colums = [];
    $.each(_arr, function (i, v) {
      var _o = {};
      _o.title = v.cn;
      _o.render = function (data, type, row, meta) {
        var color = 'black';
        if(row['status'] && row['status'] == '0')
          color = 'red';
          if(v.dict == '')
            return '<div style="color:'+ color +';">' + row[v.en] +'</div>';
          else
            return '<div style="color:'+ color +';">' + zy.cache.cd2name(v.dict, row[v.en]) +'</div>';
      };
      colums.push(_o);
    });
    return colums;
  }
  
  function DynamicWidth(container) {
    container.unbind("resize").bind("resize",function(){
      var _width0=container.find('.dataTables_scrollBody').width();
      var _width1=container.find('.dataTables_scrollBody table').width();
      zy.log(_width0+" "+_width1);
      //不出滚动条时，调整表格宽度大小；出滚动条时，不对表格进行css处理
      if(_width0>=_width1){
        zy.log("_width0>=_width1");
        container.find('.dataTables_scrollHeadInner').css('width', '100%');
        container.find('.dataTables_scrollBody table').css('width', '100%');
        container.find('.dataTables_scrollHeadInner table').css('width', '100%');
      }
    });
  }
  
  function initDicts(type,cb){
    
    var str = '';
    
    $.each(type,function(i,v){
      if(v.dict!='')
        str += v.dict + ',';
    });
    
    str = str.trimCom();
    
    if(str == ''){
      cb&&cb();
      return;
    }

    zy.cache.initDicts(str, function(){
      cb&&cb();
    });
  }

  function datatable(dt, data,func,flag,container) {
    
    initDicts(data.type,function(){
      
      var options = {
        "data": data.data,
        "columns": dyColums(data.type)
      };
  
      $.extend(options, zy.ui.dataTable);
      
      if(flag){
        dt.dataTable(options);
        DynamicWidth(container);
        flag = false;
      }
      else{
        dt.dataTable(options);
      }
      
      func&&func(data,dt);
    })
  }

  function SetDt(page, pageContainer, tablecontainer, param, func,_apiinfo,index,container) {
    tools.api({
      api: _apiinfo.api,
      app: _apiinfo.app,
      mod: _apiinfo.mod,
      page: page,
      r_param: param
    }, function (msg) {
      var count = Number(msg.count);
      if (count >= 0 && msg.data.length >=0 && msg.type.length > 0) {
        datatable(tablecontainer, msg,func,index,container);
        if(count>=zy.g.page.pagesize){
          pageContainer.jqPaginator('option', {
          totalCounts: count,
          pageSize: zy.g.page.pagesize,
          currentPage: page
        });
        }else{
          pageContainer.jqPaginator('destroy');
        }
      }else{
        pageContainer.jqPaginator('destroy');
      }
    });
  }

  return dyTable
})(zy, jQuery);
