 if(zy){
   (function($,zy){
     var tools = {
        get:function (apiinfo, cb, param, errcb) {
    
          $.extend(zy.g.am,apiinfo);
          
          delete zy.g.am.apinm;
    
          zy.net.get('api/'+ apiinfo.apinm,function(data){
            if(data && data.ret && data.ret == '0')
              cb&&cb(data);
          },param,null,errcb || null);
        },
        post:function (apiinfo, cb, param, errcb) {
          
          $.extend(zy.g.am,apiinfo);
          
          delete zy.g.am.apinm;
          
          zy.net.post('api/'+ apiinfo.apinm,function(data){
            if(data && data.ret && data.ret == '0')
              cb&&cb(data);
            else
              zy.ui.msg('提示','接口异常','e');
          },param,null,errcb || null);
        },
        random : function(){
          return new Date().getTime() + '' + Math.round(Math.random() * 10000);
        },
        async: function(count){
          return function(callback){
            var index = 0;
            var result = {};
            return function(key,value){
              index++;
              if(!result[key])
                result[key] = value;
              if(index == count)
                callback&&callback(result);
            }
          }
        },
        msg:function(content,flg){
          zy.ui.msg('提示',content,flg);
        },
        label:function(str){
          var t = '<' + str + '></' + str +'>';
          return $(t);
        }
     }
     if(!zy.extend){
       zy.extend = tools;
     }
   })(jQuery,zy)
 }
 
 
