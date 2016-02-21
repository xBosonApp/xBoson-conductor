var java    = require('java');
var jfact   = require('java-factory-lib');
var db3     = require('db3-lib');

jfact.loadjar(__dirname + '/jar/');
jfact.setJavaInstance(java);
db3.initJava(java);