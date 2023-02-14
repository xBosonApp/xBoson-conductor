/**
 *  Copyright 2023 Jing Yanming
 * 
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
var conf      = require('configuration-lib').load();
var fs        = require('fs');

var localfile = conf.eeb_zy.local_db_dir;
var confdir   = localfile + '/eeb_config/all_conf/';
var varnish   = localfile + '/eeb_config/varnish/';


module.exports = {
  save_rc       : save_rc,
  load_rc       : load_rc,
  delete_rc     : delete_rc,
  new_varnish   : new_varnish,
  get_varnish   : get_varnish,
  del_varnish   : del_varnish,
  save_varnish  : save_varnish,
};


function save_rc(rc, rcb) {
  try {
    if (rc.rid.indexOf('.') >= 0) 
      throw new Error('rid must not has "."');

    var json = JSON.stringify(rc);
    fs.writeFileSync(confdir + rc.rid, json);
    rcb();
  } catch(err) {
    rcb(err);
  }
}


//
// ? 读取配置的时候把特例配置覆盖到配置上 ?
//
function load_rc(rid, parse_to_obj, rcb) {
  if (rid.indexOf('.') >= 0) 
    throw new Error('rid must not has "."');

  fs.readFile(confdir + rid, {encoding: 'utf8'}, function(err, json) {
    if (err) {
      if (err.message.indexOf('ENOENT') >= 0) {
        err = new Error('配置同步失败');
      }
      return rcb(err);
    }
    if (parse_to_obj) {
      try {
        var rc = JSON.parse(json);
        rcb(null, rc);
      } catch(err) {
        rcb(err);
      }
    } else {
      rcb(null, json);
    }
  });
}


function delete_rc(rid, rcb) {
  fs.unlink(confdir + rid, rcb);
}


function new_varnish(vid, rcb) {
  var vconf = {
    targets : {
      /* 'tname' : { programID, run_config: {targetConfig} } */
    }
  };

  fs.writeFile(varnish + vid, JSON.stringify(vconf), rcb);
}


function get_varnish(vid, rcb) {
  fs.readFile(varnish + vid, {encoding: 'utf8'}, function(err, vconf) {
    if (err) return rcb(err);
    try {
      vconf = JSON.parse(vconf);
      rcb(null, vconf);
    } catch(err) {
      rcb(err);
    }
  });
}


function save_varnish(vid, vconf, rcb) {
  fs.writeFile(varnish + vid, vconf, rcb);
}


function del_varnish(vid) {
  fs.unlink(varnish + vid, function(err) {
    console.log(err);
  });
}