var PlayerCtrl,RootCtrl,SearchCtrl,hg2App,req_server,sys,watch_action;sys={time:0,watch:null,user:null},req_server=function(v,data,success,failed){return null==data&&(data={}),data._=Math.random(),$.ajax("http://"+ADDRESS+PATH+API.TASK+"?v="+v,{type:"POST",data:data,dataType:"json",timeout:2e3,success:function(res){return 0>res.code?"function"==typeof failed?failed(res):void 0:"function"==typeof success?success(res.value):void 0},error:function(){return"function"==typeof failed?failed({code:-400}):void 0}})},watch_action=function(){return req_server("get_tasks",{time:sys.time},function(data){return $("#control").addClass("online"),$("body").removeClass("guest"),$(data).each(function(){var target,tid;return tid=parseInt(this.tid),target=$.task[tid],null==target?$.task.push({tid:this.tid,src_type:this.srcType,added_time:this.added_time,owner:this.owner,name:this.name,playlist:this.playlist,quality:this.quality,src:this.srcUrl,thumb:this.cover,time:this.time,status:4,size:this.size,dl_size:this.dlSize,sub_task:this.subTaskTotal,sub_task_ok:this.subTaskOk}):this.time>=target.time&&(target.thumb=this.cover,target.time=this.time,target.status=this.status,target.quality=this.quality,target.size=this.size,target.dl_size=this.dlSize,target.sub_task=this.subTaskTotal,target.sub_task_ok=this.subTaskOk,this.time>sys.time)?sys.time=this.time:void 0}),sys.watch=setTimeout(watch_action,WATCH_TIME)},function(res){return $("#control").removeClass("online"),-2===res.code&&$("body").addClass("guest"),sys.watch=setTimeout(watch_action,5*WATCH_TIME)})},$(function(){var load,login_action,sys_status,sys_user;return $("#logo").click(function(){return $("body").toggleClass("temp-green"),$("body").hasClass("temp-green")?(_gaq.push(["_trackEvent","Configs","setColor","Green"]),$.cookie("temp","temp-green",{expiress:365})):(_gaq.push(["_trackEvent","Configs","setColor","Blue"]),$.removeCookie("temp"))}),"temp-green"===$.cookie("temp")&&$("body").addClass("temp-green"),$(".box-nav .nav-refresh").click(function(){return _gaq.push(["_trackEvent","Operate","Refresh",$.task.length]),$.task.reset(),sys.time=0,load()}),$(".box-nav .nav-clear").click(function(){return _gaq.push(["_trackEvent","Operate","Clean",$.task.length]),req_server("clear_tasks",{time:sys.time}),$($.task).each(function(){if(this)switch(this.status){case STATUS.RELOAD:case STATUS.CANCEL:case STATUS.COMPLETE:if("admin"===sys.user||this.owner===sys.user)return this.del()}})}),$(".box-nav .nav-program").click(function(){return _gaq.push(["_trackEvent","Operate","Program",""])}),$(".box-nav .nav-fb").click(function(){return _gaq.push(["_trackEvent","Operate","Facebook",""])}),$(".box-nav .nav-ext").click(function(){return _gaq.push(["_trackEvent","Operate","Extension",""])}),$(".box-nav .nav-logout").click(function(){var data;return _gaq.push(["_trackEvent","Operate","logout",sys.user]),data={_:Math.random(),user:"logout",pwd:"logout"},sys.user=null,$(".login").removeClass("invalid"),$.ajax("http://"+ADDRESS+PATH+API.LOGIN+"?logout",{type:"POST",data:data,dataType:"json",timeout:4e3})}),$("#dialog-chrome a").click(function(){return _gaq.push(["_trackEvent","Check","Is not chrome",$("#dialog-chrome .donot").is(":checked")]),$("body").removeClass("no-chrome"),$("#dialog-chrome .donot").is(":checked")&&$.cookie("donot-chrome","1",{expiress:365}),!0}),$.browser.chrome!==!0&&null==$.cookie("donot-chrome")&&$("body").addClass("no-chrome"),$("#dialog-ext a").click(function(){return _gaq.push(["_trackEvent","Check","Not has ext",$("#dialog-ext .donot").is(":checked")]),$("body").addClass("has-ext"),$("#dialog-ext .donot").is(":checked")&&$.cookie("donot-ext","1",{expiress:365}),!0}),($.browser.chrome!==!0||null!=$.cookie("donot-ext"))&&$("body").addClass("has-ext"),$("#dialog-qpkg a, #dialog-error a").click(function(){return $("body").removeClass("has-error no-qpkg"),!0}),sys_status=function(listen){return $.ajax("http://"+ADDRESS+PATH+API.INFO,{type:"POST",dataType:"json",data:{it:"server"},timeout:14e3,success:function(res){if(null!=res.server)switch("TRUE"!==res.server.qpkg_status?$("body").addClass("no-qpkg"):1!==res.server.process_status||0===res.server.server_status?$("body").addClass("has-error"):$("body").removeClass("no-qpkg has-error"),res.server.server_status){case 0:$("#control").attr("class","server-stopped");break;case 1:$("#control").attr("class","server-running");break;case 2:$("#control").attr("class","server-paused")}else $("body").addClass("has-error");return listen!==!1?setTimeout(sys_status,1e4):void 0},error:function(){return listen!==!1?setTimeout(sys_status,1e4):void 0}})},sys_status(),sys_user=function(listen){return $.ajax("http://"+ADDRESS+PATH+API.LOGIN+"?check",{type:"POST",dataType:"json",timeout:14e3,success:function(res){return"true"===res.status?sys.user=res.user:$("body").addClass("guest"),listen!==!1?setTimeout(sys_user,1e4):void 0},error:function(){return listen!==!1?setTimeout(sys_user,1e4):void 0}})},sys_user(),$.task.setListen(TASK.GROUP_CANCEL,function(tid){return tid.length>0?req_server("cancel_task",{tid:tid}):void 0}),$.task.setListen(TASK.GROUP_RELOAD,function(tid){return tid.length>0?req_server("redownload_task",{tid:tid}):void 0}),$.task.setListen(TASK.TASK_CANCEL,function(tid){return null!=tid?req_server("cancel_task",{tid:[tid]}):void 0}),$.task.setListen(TASK.TASK_RELOAD,function(tid){return null!=tid?req_server("redownload_task",{tid:[tid]}):void 0}),login_action=function(){var data,pwd,user;return user=$("#username").val(),pwd=$("#password").val(),data={_:Math.random(),user:user,pwd:pwd},$(".login").removeClass("invalid"),$(".login").addClass("proceed"),$.ajax("http://"+ADDRESS+PATH+API.LOGIN,{type:"POST",data:data,dataType:"json",timeout:4e3,success:function(res){return"true"==res+""?$("body").removeClass("guest"):($(".login").addClass("invalid"),$("body").addClass("guest")),sys.user=user,$(".login").removeClass("proceed")},error:function(){return $(".login").removeClass("proceed"),$("body").addClass("guest")}})},$(".login").keypress(function(e){var key;return key=e.keyCode||e.which,13===key?login_action():void 0}),$("#login-submit").click(login_action),$(".login .remember").click(function(){return $(this).toggleClass("checked")}),$("#control").click(function(){return sys_status(!1),$(this).hasClass("server-stopped")?!1:(req_server("pause_server"),$(this).toggleClass("server-paused"))}),load=function(){return null!=sys.watch&&(clearTimeout(sys.watch),delete sys.watch),sys.watch=setTimeout(watch_action,WATCH_TIME)},load()}),hg2App=angular.module("hg2",[]),hg2App.filter("startFrom",function(){return function(input,start){return input.slice(start)}}),RootCtrl=function($scope){return $scope.searchActive="inactive",$scope.guest=!1,$scope.play=function(video){return $scope.$broadcast("play",video)},$scope.updatePlaylist=function(playlist){return $scope.$broadcast("updatePlaylist",playlist)},$scope.$on("search",function(e,enable){return $scope.searchActive=enable?"active":"inactive",$scope.$apply()})},SearchCtrl=function($scope,$rootScope,$http){return delete $http.defaults.headers.common["X-Requested-With"],$http.defaults.headers.post["Content-Type"]="application/x-www-form-urlencoded",$scope.items=[],$scope.qVal="",$scope.page=1,$scope.pageTotal=1,$scope.pageStart=0,$scope.pageCount=8,$scope.nextPageToken=null,$scope.$watch("page",function(){return $scope.nextPageToken?$scope.page>$scope.items.length/$scope.pageCount-3?$scope.request($scope.nextPageToken):void 0:void 0}),$scope.prevPage=function(){return $scope.page>1&&($scope.page-=1),$scope.pageStart=($scope.page-1)*$scope.pageCount},$scope.nextPage=function(){return $scope.page<$scope.pageTotal&&($scope.page+=1),$scope.pageStart=($scope.page-1)*$scope.pageCount},$scope.request=function(page){var params;return params={key:"AIzaSyCpOMFgf1ZKObU6zyAjckcLrMuD56ZVzfM",q:$scope.qVal,part:"snippet",maxResults:50},page&&(params.pageToken=page),$http({method:"GET",url:"https://www.googleapis.com/youtube/v3/search",params:params}).success(function(res){return $scope.pageTotal=Math.ceil(res.pageInfo.totalResults/$scope.pageCount),$.each(res.items,function(i,item){return $scope.items.push({vid:item.id.videoId,title:item.snippet.title,thumb:item.snippet.thumbnails["default"].url,bigthumb:item.snippet.thumbnails.high.url,availableQuality:null,quality:{Original:!1,HD1080:!1,HD720:!1,Medium:!1,Audio:!0},url:"http://www.youtube.com/watch?v="+item.id.videoId})}),$scope.nextPageToken=res.nextPageToken?res.nextPageToken:null})},$scope.search=function(){return $scope.updatePlaylist($scope.qVal),$scope.items=[],$scope.page=1,$scope.pageTotal=1,$scope.pageStart=0,$scope.nextPageToken=null,$scope.request(),$scope.$emit("search",!0)},$scope.cancel=function(){return $scope.$emit("search",!1),$scope.items=[],$scope.qVal="",$scope.page=1,$scope.pageTotal=1,$scope.pageStart=0,$scope.nextPageToken=null},$scope.look=function(index){var item;return item=$scope.items[index+$scope.pageStart],$scope.play(item)}},PlayerCtrl=function($scope,$timeout,$http){return $scope.video={},$scope.playlist="",$scope.player=!1,$scope.$on("updatePlaylist",function(e,playlist){return $scope.playlist=playlist}),$scope.$on("play",function(e,video){return $scope.video=video,$scope.player=!0,swfobject.embedSWF("http://www.youtube.com/v/"+video.vid+"?enablejsapi=1&playerapiid=ytplayer&version=3&autoplay=1","ytplayer","640","360","8",null,null,{allowScriptAccess:"always"}),video.availableQuality?void 0:function(){var getAvailableQualityLevels;return getAvailableQualityLevels=arguments.callee,$timeout(function(){var quality;return quality="function"==typeof ytplayer.getAvailableQualityLevels?ytplayer.getAvailableQualityLevels():void 0,(null!=quality?quality.length:void 0)>0?$scope.video.availableQuality={HD1080:quality.indexOf("hd1080")?!0:void 0,HD720:quality.indexOf("hd720")?!0:void 0,Medium:quality.indexOf("medium")?!0:void 0,Original:quality.indexOf("highres")?!0:void 0}:getAvailableQualityLevels()},1e3)}()}),$scope.download=function(all){var limit,quality;return limit=1,quality=[],$scope.video.quality.Audio&&(quality.push("Audio"),limit+=1),all?quality.push("All"):($scope.video.quality.Original&&quality.push("Original"),$scope.video.quality.HD1080&&quality.push("1080P"),$scope.video.quality.HD720&&quality.push("720P"),$scope.video.quality.Medium&&quality.push("360P"),limit>quality.length&&angular.forEach($scope.video.availableQuality,function(value,key){return quality.push(key),$scope.video.quality[key]=!0})),$scope.close(),$http({method:"POST",url:"/hg2/api2/add_task.php",data:$.param({sourceType:"youtube",items:[{id:$scope.video.vid,title:$scope.video.title,url:$scope.video.url,thumb:$scope.video.thumb,bigthumb:$scope.video.bigthumb,playlist:$scope.playlist,quality:quality}]})})},$scope.close=function(){return $scope.player=!1,ytplayer.stopVideo()}},$(function(){return $(window).resize(function(){return $(".task .wrapper-list").css("min-height",$(window).height()-203),$("#group .wrapper-overflow, #group .wrapper-list").height($(window).height()-203)}),$(window).resize()});var TASK,__hasProp={}.hasOwnProperty,__extends=function(child,parent){function ctor(){this.constructor=child}for(var key in parent)__hasProp.call(parent,key)&&(child[key]=parent[key]);return ctor.prototype=parent.prototype,child.prototype=new ctor,child.__super__=parent.prototype,child};TASK={TASK_CANCEL:0,TASK_RELOAD:1,GROUP_CANCEL:2,GROUP_RELOAD:3},$.task=function(){var GroupData,TaskData,doc,group,listen,task,task_obj;return doc={group:{sample:null,download:null,list:null,cursor:null,filter:null},task:{sample:null,download:null,list:null,cursor:null,filter:null}},listen=[],GroupData=function(_super){function GroupData(data){return data instanceof jQuery&&$(data).data("GroupData")?$(data).data("GroupData"):(data.tag=null,this.dltag=null,this.sum=[0,0,0,0,0,0],Object.defineProperty(this,"name",{get:function(){return data.name}}),Object.defineProperty(this,"tag",{get:function(){var temp,val,_i,_len,_ref;if(null==data.tag)for(data.tag=doc.group.sample.clone(),data.tag.data("GroupData",this).attr("key",data.name),$(".name",data.tag).text(data.name),_ref=["thumb","owner","src_type","status"],_i=0,_len=_ref.length;_len>_i;_i++)val=_ref[_i],temp=this[val],delete data[val],this[val]=temp;return data.tag}}),Object.defineProperty(this,"thumb",{get:function(){return data.thumb||""},set:function(val){return data.thumb=val,$(".thumb .img",this.tag).empty().append($("<img onerror=\"this.src='data:image/gif;base64,R0lGODlhAwADAIAAAAAAAP///yH5BAEHAAEALAAAAAADAAMAAAIDjH8FADs='\" />").attr("src",val)),null!=this.dltag?$(".thumb .img",this.dltag).empty().append($("<img onerror=\"this.src='data:image/gif;base64,R0lGODlhAwADAIAAAAAAAP///yH5BAEHAAEALAAAAAADAAMAAAIDjH8FADs='\" />").attr("src",val)):void 0}}),Object.defineProperty(this,"owner",{get:function(){return data.owner||""},set:function(val){var temp;if(null!=val&&(val=val.toLowerCase(),null==this.owner||this.owner.toLowerCase()!==val))return temp=this.owner,data.owner=this.owner?"multiple":val,this.tag.removeClass("owner-"+temp),this.tag.addClass("owner-"+this.owner),null!=this.dltag&&(this.dltag.removeClass("owner-"+temp),this.dltag.addClass("owner-"+this.owner)),group.owner=this.owner}}),Object.defineProperty(this,"src_type",{get:function(){return data.src_type},set:function(val){var temp;if(null!=val&&(val=val.toLowerCase(),null==this.src_type||this.src_type.toLowerCase()!==val))return temp=this.src_type,data.src_type=this.src_type?"multiple":val,this.tag.removeClass("src-"+temp),this.tag.addClass("src-"+this.src_type),null!=this.dltag&&(this.dltag.removeClass("src-"+temp),this.dltag.addClass("src-"+this.src_type)),group.src=this.src_type}}),Object.defineProperty(this,"status",{get:function(){return data.status},set:function(val){return this.tag.removeClass("status-"+STATUS_NAME[data.status]),this.tag.addClass("status-"+STATUS_NAME[val]),null!=this.dltag&&(this.dltag.removeClass("status-"+STATUS_NAME[data.status]),this.dltag.addClass("status-"+STATUS_NAME[val])),data.status=val,$(".total",this.tag).text(this.sum[STATUS.COMPLETE]+" / "+this.length),null!=this.dltag?$(".total",this.dltag).text(this.sum[STATUS.COMPLETE]+" / "+this.length):void 0}}),void 0)}return __extends(GroupData,_super),GroupData.prototype.push=function(task){return Array.prototype.push.call(this,task),this.toggle(!1,task.status),null!=task.thumb&&(this.thumb=task.thumb),this.owner=task.owner,this.src_type=task.src_type,this},GroupData.prototype.del=function(task_data){var index;return index=$.inArray(task_data,this),index>-1&&(this.splice(index,1),this.toggle(task_data.status,!1),this.length>0||(group.del(this),$(this.tag).fadeOut(500,function(){return $(this).remove()}),null!=this.dltag&&$(this.dltag).fadeOut(500,function(){return $(this).remove()}))),this},GroupData.prototype.toggle=function(from,to){return null!=from&&from!==!1&&this.sum[from]--,null!=to&&to!==!1&&this.sum[to]++,this.status=1>this.sum[STATUS.WAIT]+this.sum[STATUS.DOWNLOAD]?this.sum[STATUS.FAIL]>0?STATUS.FAIL:this.sum[STATUS.COMPLETE]>0?STATUS.COMPLETE:STATUS.CANCEL:this.sum[STATUS.DOWNLOAD]>0?STATUS.DOWNLOAD:STATUS.WAIT},GroupData}(Array),$.group=group=new(function(_super){function _Class(){Object.defineProperty(this,"owner",{get:function(){return obj.filter.owner},set:function(val){return null!=val&&(val=val.toLowerCase(),0>obj.filter.owner_list.indexOf(val))?(obj.filter.owner_list.push(val),$("#filter-owner select",doc.group.filter).append($("<option />").text(val)),$("#filter").html($("#filter").html()+" #group .filter-owner-"+val+" .item:not(.owner-"+val+"){ height: 0px;border: none;}")):void 0}}),Object.defineProperty(this,"src",{get:function(){return obj.filter.src},set:function(val){return null!=val&&(val=val.toLowerCase(),0>obj.filter.src_list.indexOf(val))?(obj.filter.src_list.push(val),$("#filter-src select",doc.group.filter).append($("<option />").text(val)),$("#filter").html($("#filter").html()+" #group .filter-src-"+val+" .item:not(.src-"+val+"){ height: 0px;border: none;}")):void 0}})}var obj;return __extends(_Class,_super),obj={index:0,data:{},filter:{owner:null,owner_list:[],src:null,src_list:[]}},_Class.prototype.push=function(item){return item=new GroupData(item),obj.data[item.name]=item,Array.prototype.push.call(this,item),1===this.length&&task.toggleGroup(item),item},_Class.prototype.get=function(name){return obj.data[name]},_Class.prototype.del=function(group_data){var index;return delete obj.data[group_data.name],index=$.inArray(group_data,this),index>-1&&this.splice(index,1),this},_Class.prototype.reset=function(){for(obj.index=0,obj.data={};this.length>0;)this.pop();return obj.filter={owner:null,owner_list:[],src:null,src_list:[]},$(".item",doc.group.list).remove(),$(".item",doc.group.download).remove(),$("#filter-owner option",doc.group.filter).slice(1).remove(),$("#filter-src option",doc.group.filter).slice(1).remove(),$("#filter").empty(),this.owner="multiple",this.src="multiple",this},_Class.prototype.draw=function(){var draw,top;if(obj.index>=this.length)return obj.index=this.length;if(top=doc.group.cursor.offset().top-$(window).scrollTop(),1.5*$(window).height()>top)for(draw=[];;)if(draw.push(this[obj.index].tag),obj.index++,!(obj.index%5>0&&obj.index<this.length))break;return doc.group.cursor.before(draw),this},_Class}(Array)),TaskData=function(){function TaskData(data){return data instanceof jQuery&&$(data).data("TaskData")?$(data).data("TaskData"):(data.tid=parseInt(data.tid),data.status=parseInt(data.status),Object.defineProperty(this,"tid",{value:data.tid,writeable:!1}),Object.defineProperty(this,"playlist",{value:data.playlist,writeable:!1}),Object.defineProperty(this,"name",{value:data.name,writeable:!1}),Object.defineProperty(this,"owner",{value:data.owner,writeable:!1}),Object.defineProperty(this,"src_type",{value:data.src_type,writeable:!1}),Object.defineProperty(this,"src",{value:data.src,writeable:!1}),Object.defineProperty(this,"time",{get:function(){return data.time},set:function(val){return data.time=parseInt(val)}}),Object.defineProperty(this,"tag",{get:function(){var temp,val,_i,_len,_ref;if(null==data.tag)for(data.tag=doc.task.sample.clone(),this.tag.data("TaskData",this).attr("tid",this.tid),this.tag.addClass("src-"+data.src_type.toLowerCase()),$(".thumb",this.tag).attr("href",this.src||"#"),$(".name",this.tag).text(this.name),$(".owner",this.tag).text(this.owner),this.tag.addClass("status-"+STATUS_NAME[this.status]),_ref=["added_time","thumb","quality","size","dl_size","sub_task","sub_task_ok"],_i=0,_len=_ref.length;_len>_i;_i++)val=_ref[_i],temp=this[val],data[val]=null,this[val]=temp;return data.tag}}),Object.defineProperty(this,"status",{get:function(){return data.status},set:function(val){var belong,temp;return temp=this.status,data.status=parseInt(val),this.status!==temp&&(belong=group.get(this.playlist),belong.toggle(temp,this.status)),this.status===STATUS.DOWNLOAD?task.download=this:task.download===this&&(task.download=!1),this.tag.removeClass("status-"+STATUS_NAME[temp]),this.tag.addClass("status-"+STATUS_NAME[this.status]),null!=this.dltag?(this.dltag.removeClass("status-"+STATUS_NAME[temp]),this.dltag.addClass("status-"+STATUS_NAME[this.status])):void 0}}),Object.defineProperty(this,"quality",{get:function(){return data.quality},set:function(val){var item,quality,_i,_len;if(quality="",null!=val)for(_i=0,_len=val.length;_len>_i;_i++)if(item=val[_i],null!=item){if(item=item.toLowerCase(),""!==quality&&quality!==item){quality="multi";break}quality=item}return $(".quality",this.tag).attr("class","quality quality-"+quality),data.quality=val}}),Object.defineProperty(this,"added_time",{get:function(){return data.added_time},set:function(val){return $(".time",this.tag).text(new Date(1e3*val).toFormat("yyyy-MM-dd")),null!=this.dltag&&$(".time",this.dltag).text(new Date(1e3*val).toFormat("yyyy-MM-dd")),data.added_time=val}}),Object.defineProperty(this,"thumb",{get:function(){return data.thumb},set:function(val){var _ref;if(val!==this.thumb)return null!=(_ref=group.get(this.playlist))&&(_ref.thumb=val),$(".thumb .img",this.tag).empty().append($("<img onerror=\"this.src='data:image/gif;base64,R0lGODlhAwADAIAAAAAAAP///yH5BAEHAAEALAAAAAADAAMAAAIDjH8FADs='\" />").attr("src",val)),null!=this.dltag&&$(".thumb .img",this.dltag).empty().append($("<img onerror=\"this.src='data:image/gif;base64,R0lGODlhAwADAIAAAAAAAP///yH5BAEHAAEALAAAAAADAAMAAAIDjH8FADs='\" />").attr("src",val)),data.thumb=val}}),Object.defineProperty(this,"size",{get:function(){return data.size},set:function(val){if(data.size=parseInt(val)||0,1>this.size){if($(".est-size, dl-size",this.tag).empty(),this.dltag)return $(".est-size, dl-size",this.dltag).empty()}else if($(".est-size",this.tag).html("&nbsp;/&nbsp;"+$.filesize(this.size)),this.dltag)return $(".est-size",this.dltag).html("&nbsp;/&nbsp;"+$.filesize(this.size))}}),Object.defineProperty(this,"dl_size",{get:function(){return data.dl_size},set:function(val){return data.dl_size=parseInt(val)||0,$(".dl-size",this.tag).text($.filesize(this.dl_size)),this.dltag&&$(".dl-size",this.dltag).text($.filesize(this.dl_size)),$(".bar",this.tag).width(100*(this.dl_size/this.size)+"%"),this.dltag?$(".bar",this.dltag).width(100*(this.dl_size/this.size)+"%"):void 0}}),Object.defineProperty(this,"sub_task",{get:function(){return data.sub_task||0},set:function(val){return data.sub_task=parseInt(val)||0,this.sub_task>0&&($(this.tag).addClass("has-sub"),$(".total-sub",this.tag).html("&nbsp;/&nbsp;"+this.sub_task),this.dltag&&$(".total-sub",this.dltag).html("&nbsp;/&nbsp;"+this.sub_task),$(".bar",this.tag).width(100*(this.sub_task_ok/this.sub_task)+"%"),this.dltag)?$(".bar",this.dltag).width(100*(this.sub_task_ok/this.sub_task)+"%"):void 0}}),Object.defineProperty(this,"sub_task_ok",{get:function(){return data.sub_task_ok||0},set:function(val){return data.sub_task_ok=parseInt(val)||0,$(".ok-sub",this.tag).text(this.sub_task_ok),this.dltag&&$(".ok-sub",this.dltag).text(this.sub_task_ok),this.sub_task>0&&($(".bar",this.tag).width(100*(this.sub_task_ok/this.sub_task)+"%"),this.dltag)?$(".bar",this.dltag).width(100*(this.sub_task_ok/this.sub_task)+"%"):void 0}}),void 0)}return TaskData.prototype.dltag=null,TaskData.prototype.del=function(){return $(this.tag).fadeOut(500,function(){return $(this).remove()}),this.dltag&&$(this.dltag).fadeOut(500,function(){return $(this).remove()}),delete task[this.tid],group.get(this.playlist).del(this)},TaskData}(),task=[],task_obj={index:0,download:!1,group:null,auto_review:null},Object.defineProperty(task,"download",{get:function(){return task_obj.download},set:function(task_data){var belong,temp;return temp=this.download,temp!==task_data?(temp!==!1&&(temp.status===STATUS.DOWNLOAD&&(temp.time=(new Date).getTime()/1e3,temp.status=STATUS.COMPLETE),null!=temp.dltag&&(temp.dltag.remove(),temp.dltag=null),belong=group.get(temp.playlist),null!=belong.dltag&&(belong.dltag.remove(),belong.dltag=null)),task_data&&(task_data.dltag||(task_data.dltag=task_data.tag.clone()),$(".item",doc.task.download).is(task_data.dltag)||doc.task.download.append(task_data.dltag),belong=group.get(task_data.playlist),null==belong.dltag&&(belong.dltag=belong.tag.clone()),$(".item",doc.group.download).is(belong.dltag)||doc.group.download.append(belong.dltag)),task_obj.download=task_data):void 0}}),task.push=function(data){return $(data).each(function(){var belong,item;return item=new TaskData(this),task[item.tid]=item,belong=group.get(item.playlist),belong||(belong=group.push({name:item.playlist,owner:item.owner,thumb:item.thumb,src:item.src_type})),belong.push(item)})},task.reset=function(){for(var download;this.length>0;)this.pop();return download=!1,group.reset(),this.toggleGroup(),$(".item",doc.task.download).remove(),this},task.toggleGroup=function(playlist){var target;return target=null,task_obj.group=null!=playlist?playlist:null,null!=task_obj.auto_review&&(clearInterval(task_obj.auto_review),delete task_obj.auto_review),$(".item",doc.task.list).remove(),task_obj.index=0,task_obj.auto_review=setInterval(function(){return group.draw(),task.draw()},300)},task.draw=function(){var draw,top;if(!(null!=task_obj.group&&task_obj.index<task_obj.group.length))return this;if(top=doc.task.cursor.offset().top-$(window).scrollTop(),1.5*$(window).height()>top){for(draw=[];;)if(draw.push(task_obj.group[task_obj.index].tag),task_obj.index++,!(task_obj.index%5>0&&task_obj.index<task_obj.group.length))break;return doc.task.cursor.before(draw)}},task.setListen=function(event_code,action){return listen[event_code]=action},$(function(){var group_wrap,task_wrap;return group_wrap=$("#group"),doc.group={download:$(".wrapper-download .download",group_wrap),list:$(".wrapper-list",group_wrap),sample:$(".item",group_wrap).detach(),cursor:$(".wrapper-list .none",group_wrap),filter:$(".wrapper-filter .filter",group_wrap)},task_wrap=$(".task"),doc.task={download:$(".wrapper-download .download",task_wrap),list:$(".wrapper-list",task_wrap),sample:$(".item",task_wrap).detach(),cursor:$(".wrapper-list .none",task_wrap),filter:$(".wrapper-filter .filter",task_wrap)},task.reset(),$(".item",group_wrap).live("click",function(){var temp;return temp=group.get($(this).attr("key")),_gaq.push(["_trackEvent","Group","See",temp.name]),task.toggleGroup(temp)}),$(".cancel",group_wrap).live("click",function(){var group_data,target,wrap,_name;return wrap=$(this).parents(".item:first"),group_data=new GroupData(wrap),_gaq.push(["_trackEvent","Group","Cancel",group_data.name]),target=[],$(group_data).each(function(){switch(this.status){case STATUS.CANCEL:case STATUS.COMPLETE:break;default:return this.status=STATUS.CANCEL,this.time=(new Date).getTime()/1e3,target.push(this.tid)}}),"function"==typeof listen[_name=TASK.GROUP_CANCEL]?listen[_name](target):void 0}),$(".reload",group_wrap).live("click",function(){var group_data,target,wrap,_name;return wrap=$(this).parents(".item:first"),group_data=new GroupData(wrap),_gaq.push(["_trackEvent","Group","Reload",group_data.name]),target=[],$(group_data).each(function(){switch(this.status){case STATUS.RELOAD:case STATUS.WAIT:break;default:return this.dl_size=0,this.sub_task_ok=0,this.status=STATUS.RELOAD,this.time=(new Date).getTime()/1e3,target.push(this.tid)}}),"function"==typeof listen[_name=TASK.GROUP_RELOAD]?listen[_name](target):void 0}),$("select",doc.group.filter).on("change",function(){var id,item,reg,selected,target,val,_i,_len,_ref;for(id=$(this).parent().attr("id"),reg=RegExp("^"+id+"-.+"),selected=$("option:selected",this),val=selected.val(),target=[],_gaq.push(["_trackEvent","Group",id,val]),$(this).prev().text(selected.text()),_ref=$(doc.group.list).attr("class").split(" "),_i=0,_len=_ref.length;_len>_i;_i++)item=_ref[_i],reg.exec(item)&&target.push(item);return target.length>0&&$(doc.group.list).removeClass(target.join(" ")),selected.is(":first-child")?void 0:$(doc.group.list).addClass(id+"-"+val)}).change(),$(".cancel",task_wrap).live("click",function(){var tid,wrap,_name;return wrap=$(this).parents(".item:first"),tid=wrap.attr("tid"),_gaq.push(["_trackEvent","Task","Cancel",task[tid].name]),task[tid]&&(task[tid].status=STATUS.CANCEL,task[tid].time=(new Date).getTime()/1e3),"function"==typeof listen[_name=TASK.TASK_CANCEL]?listen[_name](tid):void 0}),$(".reload",task_wrap).live("click",function(){var tid,wrap,_name;return wrap=$(this).parents(".item:first"),tid=wrap.attr("tid"),_gaq.push(["_trackEvent","Task","Reload",task[tid].name]),task[tid]&&(task[tid].dl_size=0,task[tid].sub_task_ok=0,task[tid].status=STATUS.RELOAD,task[tid].time=(new Date).getTime()/1e3),"function"==typeof listen[_name=TASK.TASK_RELOAD]?listen[_name](tid):void 0}),$(doc.task.filter).delegate("li","click",function(){var item,reg,target,_i,_len,_ref;for(reg=RegExp("^filter-status-.+"),target=[],_gaq.push(["_trackEvent","Task","Status",$(this).attr("for")]),_ref=$(doc.task.list).attr("class").split(" "),_i=0,_len=_ref.length;_len>_i;_i++)item=_ref[_i],reg.exec(item)&&target.push(item);return target.length>0&&$(doc.task.list).removeClass(target.join(" ")),$(doc.task.list).addClass("filter-status-"+$(this).attr("for")),$(this).addClass("active"),$(this).siblings().removeClass("active")})}),task}();