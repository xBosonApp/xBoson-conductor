var path = require('path');
var clib = require('configuration-lib');

//
// 在磁盘上建立如下目录
// 所有相关的配置都保存在这里
//
var local_dir = clib.nodeconf + '/conductor-config';


module.exports = {

  port : 8012,
  ext_config_file : local_dir + '/config.json',
  
  
  logger : {
    logLevel      : 'INFO',
    log_dir       : local_dir + '/logs',
    log_size      : 5 * 1024 * 1024,
    reserve_count : 30
  },


  masquerade : {
    public   : path.normalize(__dirname + "/../www/public"),
    private  : path.normalize(__dirname + "/../www/private"),

    // 是服务器端运行的 html 代码的扩展名
    extname        : 'htm',
    // include / slice 会引起循环嵌套, 这里指定最大的嵌套层级
    depth_max      : 10,
    // 文件缓存时间, 秒
    cache_time     : 60 * 60,
    max_file_size  : 2 * 1024*1024,
    // 模板文件的编码
    encoding       : 'utf8',
    // 根路径默认页面在 public 目录中
    default_page   : 'index.htm'
  },


  eeb_zy: {
    // 是否有平台开关
    has_zy_server : false,

    // 平台的 ip 和 port
    ip   : 'zr-i.com',
    port : 8088,
    sys  : 'da4a81635b4c453aaea3598e81e6e3dc',
    // 启用平台认证, 多用户配置分离
    use_auth : false,

    // 本地数据存储目录
    local_db_dir   : local_dir,


    // 日志输出数据库的配置, 只支持 mysql, h2 数据库, 其他未测试
    log_db : {
      // h2 数据库在写出大量数据时, 性能低下, 会卡住主进程
      // driver   : 'h2local',
      // host     : local_dir + '/db',
      // port     : 0,
      // user     : 'sa',
      // password : 'zy zy',
      // database : 'eeb'

      driver   : 'mysql',
      host     : 'localhost',
      port     : '3306',
      user     : 'root',
      password : 'root',
      database : 'eeb',

      // 扩展日志系统存储目标数据库, 安装时不会自动创建表
      extlog : {
        t_sta    : 'sys_pl_log_etl_statistics',
        t_dat    : 'sys_pl_log_etl_statistics_data',
        s_sta    : 'sys_pl_log_esb_statistics',
      }
    },

    ws_server  : {
      http_port: 8013,
      proxy_pw : '3n6$5432.fxnvfje3w'
    }
  }
};