/**
 * UI
 * @class zyInput
 *
 * 用法说明：
 *  var t_ = new zyInput();
 *  t_.toSelect2(apiUrl,"#e10_2",options); // 1.接口 2.需要转换的对象 3.配置
 */
zyInput = (function () {

  var PT = zyInput.prototype;
  var thiz;

  var data1 = [//id必选 相当于value 测试用
    {id: "0", tag: 'api1', tag: '1eeeee'},//数据源中可存在其他字段
    {id: "1", tag: 'api2', tag: '2aeeeeeeeee'},
    {id: "2", tag: 'api3', tag: '3eeeeeeeeeeeeeee'},
    {id: "3", tag: 'api4', tag: '4beeeee'},
    {id: "4", tag: 'api5', tag: '5aaeeeeeeeee'}
  ];


  function zyInput() {
//  zy.log("new zyInput()");
    thiz = this;
    thiz.Init();
    return this;
  }

  PT.Init = function () {
//    if (!!window.localStorage) {    //本地存储
//      zy.log("support localStorage");
//      localStorage.setItem("test", JSON.stringify(data1));
//    } else {
//      zy.log("don't support localStorage")
//    }
  };

  PT.defaults = {
    placeholder: "Search for sth", //默认显示的文本
    allowClear: true, //选择后出现
    data: {} //指定数据源
    //  dropdownCssClass          //下拉css
  };

  PT.FormatResult = function (item) {
    return item.name;
  };

  PT.sortResults = function (results, container, query) { //排序
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
  };

  PT.FormatSelection = function (item) {
    return item.name;
  };

  PT.toSelect2 = function (data, el, options) {//现有input转换为select2
    var all = {id: '', name: '全部', text: '全部(QB)'};
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
    $(el).select2(opt);
  };

  return zyInput;
})();
