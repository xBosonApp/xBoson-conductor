 var zy_date=function(){
  
  function Init(cb){
    // loadScript("lib/js/plugin/bootstrap-datepicker/bootstrap-datepicker.js");
    // loadScript("lib/js/plugin/bootstrap-datepicker/bootstrap-datepicker.zh-CN.js");

  }
   Init();
  function date(){
    var show=function(con){
      console.log(con);
      con.blur(function () {
        var tar=$('.datepicker ').css('z-index', '-999999');
      });
    }
    var option={
      id:1
    }
    var input=buildInput(show,null,option);
    // var input=$('<input>');
    // input.attr({
    //   'type':'text',
    //   // 'class':'form-control',
    //   'name':'task_date',
    //   'placeholder':'日期'
    // });
    input.datepicker(
      {
        format: 'yyyy-mm-dd',
        startDate: '-0d',
        autoclose: true
      }
      );

    return input
  }
  
  function date2(){
    var show=function(con){
      console.log(con);
       con.blur(function () {
        var tar=$('.datepicker ').css('z-index', '-999999');
      });
    }
    var option={
      id:2
    }
    var input=buildInput(show,null,option);
    // var input=$('<input>');
    // input.attr({
    //   'type':'text',
    //   // 'class':'form-control',
    //   'name':'task_endtime',
    //   'placeholder':'日期'

    // });
    input.datepicker(
      {
        format: 'yyyy-mm-dd',
        startDate: '-0d',
        autoClose: true
      }
      );

    return input
  }
  
  
  
  function buildInput(show,hide,option){
    var input=$('<input>');
    input.attr({
      'type':'text',
      // 'class':'form-control',
      // 'name':'task_date',
      'placeholder':'日期'
    });
    if(option.id==1) input.attr('name','task_date');
    if(option.id==2) input.attr('name','task_endtime')
    
    input.on('show.datepicker', function(e){
        var tar=$('.datepicker');
      tar.css('z-index', '999999');
      show&&show(tar);
    });
    
    
    
    
    return input
  }
  
  
  return {
    date:date,
    date2:date2
          }
    
  
 }