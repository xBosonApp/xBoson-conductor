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
(function() {

var wstype = {

  '字符串' : {
    '普通字符串'               : 'xsd:string',
    '规格化字符串'             : 'xsd:normalizedString',
    'Token'                    : 'xsd:token',
    'ID 属性'                  : 'xsd:ID',
    'Name'                     : 'xsd:Name',
    'NCName'                   : 'xsd:NCName',
    'NMTOKEN'                  : 'xsd:NMTOKEN',
    'QName'                    : 'xsd:QName'
  },

  '日期' : {
    '日期'                     : 'xsd:date',
    '时间'                     : 'xsd:time',
    '日期时间'                 : 'xsd:dateTime',
    '持续时间'                 : 'xsd:duration'
  },

  '数值' : {
    '十进制数'                 : 'xsd:decimal',
    '64位浮点数'               : 'xsd:double',
    '32 位浮点数'              : 'xsd:float',
    '整数'                     : 'xsd:integer',
    '有正负的 8 位整数'        : 'xsd:byte',
    '有正负的 16 位整数'       : 'xsd:short',
    '有正负的 32 位整数'       : 'xsd:int',
    '有正负的 64 位整数'       : 'xsd:long',
    '无正负的 8 位整数'        : 'xsd:unsignedByte',
    '无正负的 16 位整数'       : 'xsd:unsignedShort',
    '无正负的 32 位整数'       : 'xsd:unsignedInt',
    '无正负的 64 位整数'       : 'xsd:unsignedLong',
    '仅包含负值的整数'         : 'xsd:negativeInteger',
    '仅包含非负值的整数'       : 'xsd:nonNegativeInteger',
    '仅包含非正值的整数'       : 'xsd:nonPositiveInteger',
    '仅包含正值的整数'         : 'xsd:positiveInteger'
  },

  '其他' : {
    '十六进制编码的二进制数据' : 'xsd:hexBinary',
    'Base64 编码的二进制数据'  : 'xsd:base64Binary',
    'URI 地址'                 : 'xsd:anyURI',
    '逻辑'                     : 'xsd:boolean',
    'NOTATION'                 : 'xsd:notation'
  }
};


//
// 初始化一个 <select> 为类型列表
//
window.eeb.init_select_to_ws_type = function(jselect, select_val) {
  var html = [];
  var _ = function(s) { html.push(s); return _; };


  for (var type in wstype) {
    _('<optgroup label="')(type)('">');

    var sub = wstype[type];

    for (var n in sub) {
      _('<option value="')(sub[n])('">')(n)('</option>');
    }

    _('</optgroup>');
  }
  
  jselect.html(html.join(''));
  jselect.select2({ width: '100%' });
  jselect.select2('val', select_val || 'xsd:string');
}

})();