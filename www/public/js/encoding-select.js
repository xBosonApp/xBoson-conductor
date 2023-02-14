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

var list = {

  'Full Unicode' : [
    'UTF-8',
    'UCS-2', 'UCS-2BE', 'UCS-2LE',
    'UCS-4', 'UCS-4BE', 'UCS-4LE',
    'UTF-16', 'UTF-16BE', 'UTF-16LE',
    'UTF-32', 'UTF-32BE', 'UTF-32LE',
    'UTF-7',
    'C99', 'JAVA'
    ],

  '中文编码' : [
    'GBK', 'CP936', 'GB18030', 'EUC-TW', 'BIG5', 'CP950', 'BIG5-HKSCS',
    'BIG5-HKSCS:2004', 'BIG5-HKSCS:2001', 'BIG5-HKSCS:1999', 'ISO-2022-CN',
    'ISO-2022-CN-EXT', 'BIG5-2003 (experimental)' , 'EUC-CN', 'HZ'
    ],

  'European languages' : [
    'ASCII', 'ISO-8859-1','ISO-8859-2','ISO-8859-3','ISO-8859-4','ISO-8859-5','ISO-8859-7',
    'ISO-8859-9','ISO-8859-10','ISO-8859-13','ISO-8859-14','ISO-8859-15','ISO-8859-16',
    'KOI8-R', 'KOI8-U', 'KOI8-RU',
    'CP437','CP737','CP775','CP850','CP852','CP853','CP855','CP857','CP858',
    'CP860','CP861','CP863','CP865','CP866','CP869',
    'CP1125','CP1250','CP1251','CP1252','CP1253','CP1254','CP1257',
    'MacRoman','MacCentralEurope','MacIceland','MacCroatian','MacRomania',
    'MacCyrillic','MacUkraine','MacGreek','MacTurkish',
    'Macintosh'
    ],

  'Semitic languages' : [
    'ISO-8859-6','ISO-8859-8', 'CP1255','CP1256', 'CP862', 'CP864', 'MacHebrew','MacArabic'
    ],

  'Japanese' : [
    'EUC-JP', 'SHIFT_JIS', 'CP932', 'ISO-2022-JP', 'ISO-2022-JP-2', 'ISO-2022-JP-1',
    'EUC-JISX0213', 'Shift_JISX0213', 'ISO-2022-JP-3'
    ],

  'Korean' : [
    'EUC-KR', 'CP949', 'ISO-2022-KR', 'JOHAB'
    ],

  'Turkmen' : [
    'TDS565'
    ],

  'Armenian' : [
    'ARMSCII-8'
    ],

  'Georgian' : [
    'Georgian-Academy', 'Georgian-PS'
    ],

  'Tajik' : [
    'KOI8-T'
    ],

  'Kazakh' : [
    'PT154', 'RK1048'
    ],

  'Thai' : [
    'ISO-8859-11', 'TIS-620', 'CP874', 'MacThai'
    ],

  'Laotian' : [
    'MuleLao-1', 'CP1133'
    ],

  'Vietnamese' : [
    'VISCII', 'TCVN', 'CP1258'
    ],

  'Platform specifics' : [
    'HP-ROMAN8', 'NEXTSTEP', 'ATARIST', 'RISCOS-LATIN1'
    ]
};


//
// 初始化一个 <select> 为编码列表
//
window.eeb.init_select_to_encoding = function(jselect, select_val) {
  var html = [];
  var _ = function(s) { html.push(s); return _; };


  for (var type in list) {
    _('<optgroup label="')(type)('">');

    var sub = list[type];
    var len = sub.length;

    for (var i=0; i<len; ++i) {
      _('<option value="')(sub[i])('">')(sub[i])('</option>');
    }

    _('</optgroup>');
  }
  
  jselect.html(html.join(''));
  jselect.select2({ width: '100%' });
  jselect.select2('val', select_val);
}

})();