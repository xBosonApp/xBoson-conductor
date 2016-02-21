require('./init_java.js');
var clib = require('configuration-lib');

clib.wait_init(function() {


var dbtool = require('./lib/db-tool.js');
var conf   = clib.load();
var dbconf = conf.eeb_zy.log_db;


//
// 执行失败, 也不会终止
//
var ddl = [
  // 'DROP TABLE IF EXISTS sys_eeb_work_node',
  // 'DROP TABLE IF EXISTS sys_eeb_run_conf',
  // 'DROP TABLE IF EXISTS sys_eeb_jobgroup',
  // 'DROP TABLE IF EXISTS sys_eeb_statistics',
  // 'DROP TABLE IF EXISTS sys_eeb_sche',

  "CREATE TABLE IF NOT EXISTS sys_eeb_work_node (                   \
          id       VARCHAR(32) PRIMARY KEY,                         \
          state    INT COMMENT '状态 1-在线, 0-离线',               \
          ip       VARCHAR(32) NOT NULL COMMENT '远端IP',           \
          host     VARCHAR(32) NOT NULL COMMENT '远端主机名称',     \
          port     INT NOT NULL COMMENT '远端主机访问端口',         \
          info     VARCHAR(99) NOT NULL COMMENT '与系统相关的信息', \
          lastout  DATETIME COMMENT '最后离线时间' )",

  "CREATE TABLE IF NOT EXISTS sys_eeb_run_conf (                    \
          id       VARCHAR(32) PRIMARY KEY,                         \
          name     VARCHAR(99) NOT NULL,                            \
          type     INT NOT NULL COMMENT '1:ETL 2:ESB 4:BPM',        \
          wid      VARCHAR(32) NOT NULL COMMENT '工作节点 WORK_NODE.ID' )",

  "CREATE TABLE IF NOT EXISTS sys_eeb_jobgroup (                    \
          id       VARCHAR(32) PRIMARY KEY,                         \
          name     VARCHAR(64) UNIQUE,                              \
          type     INT,                                             \
          wid      VARCHAR(32) NOT NULL COMMENT '工作节点 WORK_NODE.ID' )",

  "CREATE TABLE IF NOT EXISTS sys_eeb_statistics (                  \
          runid    VARCHAR(32) COMMENT '运行时' PRIMARY KEY,        \
          rid      VARCHAR(32) NOT NULL COMMENT '配置 RUN_CONF.ID', \
          iid      VARCHAR(32) NOT NULL COMMENT '实例',             \
          cid      VARCHAR(32) NOT NULL COMMENT 'JOBGROUP.ID',      \
          tbegin   DATETIME NOT NULL,                               \
          tend     DATETIME ,                                       \
          name     VARCHAR(256) NOT NULL,                           \
          msg      VARCHAR(2000) )",

  "CREATE TABLE IF NOT EXISTS sys_eeb_detail (                      \
          intime   BIGINT,                                          \
          runid    VARCHAR(32) NOT NULL,                            \
          rid      VARCHAR(32) NOT NULL,                            \
          time     DATETIME NOT NULL,                               \
          rcname   VARCHAR(256) NOT NULL COMMENT '运行时',          \
          pname    VARCHAR(256) NOT NULL COMMENT '程序',            \
          tname    VARCHAR(256) NOT NULL COMMENT '目标',            \
          msg      VARCHAR(2000),                                   \
          data     VARCHAR(2000) )",

  "CREATE TABLE IF NOT EXISTS sys_eeb_sche (                        \
          id           VARCHAR(32) PRIMARY KEY,                     \
          rid          VARCHAR(32) NOT NULL,                        \
          gid          VARCHAR(32) COMMENT '采集点 JOBGROUP.ID',    \
          vid          VARCHAR(32) COMMENT 'sys_eeb_varnish.vid',   \
          name         VARCHAR(256) NOT NULL,                       \
          task_time    VARCHAR(20),                                 \
          cycle        VARCHAR(10),                                 \
          run_times    VARCHAR(10),                                 \
          run_end_time VARCHAR(10),                                 \
          intervall    VARCHAR(10),                                 \
          json         VARCHAR(2000) )",

  "CREATE TABLE IF NOT EXISTS sys_eeb_varnish (                     \
          name         VARCHAR(64) NOT NULL UNIQUE,                 \
          vid          VARCHAR(32) PRIMARY KEY,                     \
          wid          VARCHAR(32) NOT NULL,                        \
          rid          VARCHAR(32) NOT NULL COMMENT '配置模板' )",

// -------------------------------- 下面的脚本为了兼容已有的表做的升级修改

  "ALTER TABLE `sys_eeb_statistics`         \
         ADD INDEX `rid` (`rid` ASC) COMMENT '加快查询速度' ",

  "ALTER TABLE `sys_eeb_detail`             \
         ADD INDEX `runid` (`runid` ASC, `intime` ASC) ",

  "ALTER TABLE `sys_eeb_statistics`         \
         ENGINE = MyISAM",

  "ALTER TABLE `sys_eeb_detail`             \
         ENGINE = MyISAM",

  "ALTER TABLE sys_eeb_sche                 \
         CHANGE COLUMN task_time task_time VARCHAR(20) NULL",

  "ALTER TABLE sys_eeb_sche                 \
         ADD COLUMN `gid` VARCHAR(32) NULL",

  "ALTER TABLE sys_eeb_statistics           \
         CHANGE COLUMN `tend` `tend` DATETIME NULL",

  "ALTER TABLE `sys_eeb_sche`               \
         ADD COLUMN `vid` VARCHAR(32) NULL COMMENT 'sys_eeb_varnish.vid'",

];


var localfile = conf.eeb_zy.local_db_dir;

var dirs = [
  localfile,
  localfile + '/logs',
  localfile + '/log_cache',
  localfile + '/eeb_config',
  localfile + '/eeb_config/all_conf',
  localfile + '/eeb_config/varnish',
];

dbtool.createTable(dbconf, ddl);
dirs.forEach(clib.mkdir);


});

/* ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== 
 * 扩展日志数据创建
 * ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== 

use `eeb-jym-test`;

CREATE TABLE `sys_pl_log_etl_statistics_data` (
  `runningid` char(32) NOT NULL COMMENT '单次执行ID',
  `data_row` decimal(10,0) NOT NULL COMMENT '原始数据行号',
  `log_data` varchar(2000) DEFAULT NULL COMMENT '错误数据',
  `createdt` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`runningid`,`data_row`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='ETL集群统计日志错误数据';

CREATE TABLE `sys_pl_log_etl_statistics` (
  `logid` char(32) NOT NULL COMMENT '日志ID',
  `log_date_char` char(8) DEFAULT NULL COMMENT '八位日期',
  `log_time_char` char(6) DEFAULT NULL COMMENT '6位时间',
  `instanceid` char(32) DEFAULT NULL COMMENT '部署实例ID',
  `daqid` char(32) DEFAULT NULL COMMENT '采集点ID',
  `jobid` char(32) DEFAULT NULL COMMENT '作业ID',
  `runningid` char(32) DEFAULT NULL COMMENT '单次执行ID',
  `event_type` char(2) DEFAULT NULL COMMENT '日志事件类型',
  `log` varchar(2000) DEFAULT NULL COMMENT '日志内容',
  `cnt` decimal(10,0) DEFAULT NULL COMMENT '处理数',
  `data_row` decimal(10,0) DEFAULT NULL COMMENT '原始数据行号',
  `createdt` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`logid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='ETL集群统计日志';

CREATE TABLE `sys_pl_log_esb_statistics` (
  `logid` char(32) NOT NULL COMMENT '日志ID',
  `log_date_char` char(8) DEFAULT NULL COMMENT '八位日期',
  `log_time_char` char(6) DEFAULT NULL COMMENT '6位时间',
  `instanceid` char(32) DEFAULT NULL COMMENT '部署实例ID',
  `serviceid` char(32) DEFAULT NULL COMMENT '流的主键',
  `runningid` char(32) DEFAULT NULL COMMENT '服务被请求生成id',
  `event_type` char(2) DEFAULT NULL COMMENT '事件类型',
  `log` varchar(2000) DEFAULT NULL COMMENT '日志内容',
  `createdt` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`logid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='ESB集群统计日志';

==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== */