/*
 * ----------------------------------------------------------------------------
 * Package:     JS Date Format Patch
 * Version:     0.9.12
 * Date:        2012-07-06
 * Description: In lack of decent formatting ability of Javascript Date object,
 *              I have created this "patch" for the Date object which will add 
 *              "Date.format(dateObject, format)" static function, and the 
 *              "dateObject.toFormattedString(format)" member function.
 *              Along with the formatting abilities, I have also added the 
 *              following functions for parsing dates:
 *              "Date.parseFormatted(value, format)" - static function
 *              "dateObject.fromFormattedString(value, format)" - member 
 *              function
 * Author:      Miljenko Barbir
 * Author URL:  http://miljenkobarbir.com/
 * Repository:  http://github.com/barbir/js-date-format
 * ----------------------------------------------------------------------------
 * Copyright (c) 2010 Miljenko Barbir
 * Dual licensed under the MIT and GPL licenses.
 * ----------------------------------------------------------------------------
 */
(function(){Date.format=function(e,f){var c=Date.formatLogic,b=-1!==f.indexOf("a")||-1!==f.indexOf("A"),a=[];a.d=e.getDate();a.dd=c.pad(a.d,2);a.ddd=c.i18n.shortDayNames[e.getDay()];a.dddd=c.i18n.dayNames[e.getDay()];a.M=e.getMonth()+1;a.MM=c.pad(a.M,2);a.MMM=c.i18n.shortMonthNames[a.M-1];a.MMMM=c.i18n.monthNames[a.M-1];a.yyyy=e.getFullYear();a.yyy=c.pad(a.yyyy,2)+"y";a.yy=c.pad(a.yyyy,2);a.y="y";a.H=e.getHours();a.hh=c.pad(b?c.convertTo12Hour(a.H):a.H,2);a.h=b?c.convertTo12Hour(a.H):a.H;a.HH=c.pad(a.H,
2);a.m=e.getMinutes();a.mm=c.pad(a.m,2);a.s=e.getSeconds();a.ss=c.pad(a.s,2);a.z=e.getMilliseconds();a.zz=a.z+"z";a.zzz=c.pad(a.z,3);a.ap=12>a.H?"am":"pm";a.a=12>a.H?"am":"pm";a.AP=12>a.H?"AM":"PM";a.A=12>a.H?"AM":"PM";for(var c=0,d=b="";c<f.length;){for(d=f.charAt(c);c+1<f.length&&void 0!==a[d+f.charAt(c+1)];)d+=f.charAt(++c);b=void 0!==a[d]?b+a[d]:b+d;c++}return b};Date.formatLogic={pad:function(e,f){var c="";if(1>f)return"";for(var b=0;b<f;b++)c+="0";b=e;b=c+e;return b=b.substring(b.length-f)},
convertTo12Hour:function(e){return 0===e%12?12:e%12},i18n:{dayNames:"Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),shortDayNames:"Sun Mon Tue Wed Thu Fri Sat".split(" "),monthNames:"January February March April May June July August September October November December".split(" "),shortMonthNames:"Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ")}};Date.prototype.toFormat=function(e){return Date.format(this,e)};Date.parseFormat=function(e,f){var c=new Date(2E3,0,1),
b=[];b.d="([0-9][0-9]?)";b.dd="([0-9][0-9])";b.M="([0-9][0-9]?)";b.MM="([0-9][0-9])";b.yyyy="([0-9][0-9][0-9][0-9])";b.yyy="([0-9][0-9])[y]";b.yy="([0-9][0-9])";b.H="([0-9][0-9]?)";b.hh="([0-9][0-9])";b.h="([0-9][0-9]?)";b.HH="([0-9][0-9])";b.m="([0-9][0-9]?)";b.mm="([0-9][0-9])";b.s="([0-9][0-9]?)";b.ss="([0-9][0-9])";b.z="([0-9][0-9]?[0-9]?)";b.zz="([0-9][0-9]?[0-9]?)[z]";b.zzz="([0-9][0-9][0-9])";b.ap="([ap][m])";b.a="([ap][m])";b.AP="([AP][M])";b.A="([AP][M])";for(var a=Date.parseLogic,d=0,j=
"",h=[""],g="";d<f.length;){for(g=f.charAt(d);d+1<f.length&&void 0!==b[g+f.charAt(d+1)];)g+=f.charAt(++d);void 0!==b[g]?(j+=b[g],h[h.length]=g):j+=g;d++}b=e.match(RegExp(j));if(!(void 0===b||b.length!==h.length)){for(d=0;d<h.length;d++)if(""!==h[d])switch(h[d]){case "yyyy":case "yyy":c.setYear(a.parseInt(b[d]));break;case "yy":c.setYear(2E3+a.parseInt(b[d]));break;case "MM":case "M":c.setMonth(a.parseInt(b[d])-1);break;case "dd":case "d":c.setDate(a.parseInt(b[d]));break;case "hh":case "h":case "HH":case "H":c.setHours(a.parseInt(b[d]));
break;case "mm":case "m":c.setMinutes(a.parseInt(b[d]));break;case "ss":case "s":c.setSeconds(a.parseInt(b[d]));break;case "zzz":case "zz":case "z":c.setMilliseconds(a.parseInt(b[d]));break;case "AP":case "A":case "ap":case "a":("PM"===b[d]||"pm"===b[d])&&12>c.getHours()&&c.setHours(c.getHours()+12),("AM"===b[d]||"am"===b[d])&&12===c.getHours()&&c.setHours(0)}return c}};Date.parseLogic={unpad:function(e){for(;1<e.length;)if("0"===e[0])e=e.substring(1,e.length);else break;return e},parseInt:function(e){return parseInt(this.unpad(e),
10)}};Date.prototype.fromFormat=function(e,f){this.setTime(Date.parseFormat(e,f).getTime());return this}})();
/* Helper Filesize*/
$.filesize=function(d,c){var b,e,a,f,g;null==c&&(c=0);a=["bytes","KB","MB","GB","TB"];b=f=0;for(g=a.length;f<g;b=++f)if(e=d/Math.pow(1024,b),1024>e)return 0===b?0===d?"0KB":"> 1KB":e.toFixed(c)+a[b];return(d/Math.pow(1024,a.length-1)).toFixed(c)+a[a.length-1]};
