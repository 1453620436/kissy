/*
Copyright 2013, KISSY v1.40dev
MIT Licensed
build time: Sep 16 18:14
*/
KISSY.add("editor/plugin/font-family/cmd",function(d,e,a){var b={element:"span",styles:{"font-family":"#(value)"},overrides:[{element:"font",attributes:{face:null}}]};return{init:function(c){a.addSelectCmd(c,"fontFamily",b)}}},{requires:["editor","../font/cmd"]});
