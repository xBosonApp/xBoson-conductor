 (function($){
   
   
   function subString(target,start,end){
     if(typeof target != 'string' ||typeof start != 'string' || typeof end != 'string')
       return zy.log('非法');
     var result = '';
     var indexStart = target.indexOf(start);
     var indexEnd = target.indexOf(end,indexStart);
     result = target.substr(indexStart,indexEnd);
     return result;
   }
   
   function init(cb){
     var href = location.href;
     var host = location.host;
     var start = href.indexOf(host) + host.length + 1;
     var sub = href.substr(start,href.length);
     var path = '//'+ host + '/' + subString(sub,'','/') + '/paas/';
     cb&&cb(path)
   }
   
   function build(target,content){
     target.editable({
        type: 'text',
        title: '测试',
        placement: 'right'
        // value: 2,
        // source: [
        //     {value: 1, text: 'status 1'},
        //     {value: 2, text: 'status 2'},
        //     {value: 3, text: 'status 3'}
        // ]
        /*
        //uncomment these lines to send data on server
        ,pk: 1
        ,url: '/post'
        */
    });
    
    target.click(function(e){
      var toReplace = $(this).next();
      toReplace.find('.control-group.form-group')
        .append(content.clone(true));
    })
   }
   
   init(function(_p){
     $.getScript(_p + 'lib/js/plugin/x-editable/x-editable.js',function(){
       zy.tool.xedittable = build;
     })
   })
   
 })(jQuery)