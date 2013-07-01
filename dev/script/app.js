/*
Variable Initialization
*/

var PlayerCtrl, RootCtrl, SearchCtrl, hg2App, req_server, sys, watch_action;

sys = {
  time: 0,
  watch: null,
  user: null
};

/*
request to server
v: get_task, get_tasks, cancel_task, redownload_task, clear_tasks, pause_server
*/


req_server = function(v, data, success, failed) {
  if (data == null) {
    data = {};
  }
  data._ = Math.random();
  return $.ajax("http://" + ADDRESS + PATH + API.TASK + "?v=" + v, {
    type: "POST",
    data: data,
    dataType: "json",
    timeout: 2000,
    success: function(res) {
      if (res.code < 0) {
        return typeof failed === "function" ? failed(res) : void 0;
      } else {
        return typeof success === "function" ? success(res.value) : void 0;
      }
    },
    error: function(xhr, ajaxOptions, thrownError) {
      return typeof failed === "function" ? failed({
        code: -400
      }) : void 0;
    }
  });
};

/*
Watch Action
*/


watch_action = function() {
  return req_server("get_tasks", {
    time: sys.time
  }, function(data) {
    $("#control").addClass("online");
    $('body').removeClass('guest');
    $(data).each(function() {
      var target, tid;

      tid = parseInt(this.tid);
      target = $.task[tid];
      if (target == null) {
        return $.task.push({
          tid: this.tid,
          src_type: this.srcType,
          added_time: this.added_time,
          owner: this.owner,
          name: this.name,
          playlist: this.playlist,
          quality: this.quality,
          src: this.srcUrl,
          thumb: this.cover,
          time: this.time,
          status: 4,
          size: this.size,
          dl_size: this.dlSize,
          sub_task: this.subTaskTotal,
          sub_task_ok: this.subTaskOk
        });
      } else if (this.time >= target.time) {
        target.thumb = this.cover;
        target.time = this.time;
        target.status = this.status;
        target.quality = this.quality;
        target.size = this.size;
        target.dl_size = this.dlSize;
        target.sub_task = this.subTaskTotal;
        target.sub_task_ok = this.subTaskOk;
        if (this.time > sys.time) {
          return sys.time = this.time;
        }
      }
    });
    return sys.watch = setTimeout(watch_action, WATCH_TIME);
  }, function(res) {
    $("#control").removeClass("online");
    if (res.code === -2) {
      $('body').addClass('guest');
    }
    return sys.watch = setTimeout(watch_action, WATCH_TIME * 5);
  });
};

/*
Main
*/


$(function() {
  /*
  Initialization button
  */

  var load, login_action, sys_status, sys_user;

  $('#logo').click(function() {
    $('body').toggleClass('temp-green');
    if ($('body').hasClass('temp-green')) {
      _gaq.push(['_trackEvent', 'Configs', 'setColor', 'Green']);
      return $.cookie('temp', 'temp-green', {
        expiress: 365
      });
    } else {
      _gaq.push(['_trackEvent', 'Configs', 'setColor', 'Blue']);
      return $.removeCookie('temp');
    }
  });
  if ($.cookie('temp') === 'temp-green') {
    $('body').addClass('temp-green');
  }
  $(".box-nav .nav-refresh").click(function() {
    _gaq.push(['_trackEvent', 'Operate', 'Refresh', $.task.length]);
    $.task.reset();
    sys.time = 0;
    return load();
  });
  $(".box-nav .nav-clear").click(function() {
    _gaq.push(['_trackEvent', 'Operate', 'Clean', $.task.length]);
    req_server("clear_tasks", {
      time: sys.time
    });
    return $($.task).each(function() {
      if (!this) {
        return;
      }
      switch (this.status) {
        case STATUS.RELOAD:
        case STATUS.CANCEL:
        case STATUS.COMPLETE:
          if (sys.user === "admin" || this.owner === sys.user) {
            return this.del();
          }
      }
    });
  });
  $(".box-nav .nav-program").click(function() {
    return _gaq.push(['_trackEvent', 'Operate', 'Program', '']);
  });
  $(".box-nav .nav-fb").click(function() {
    return _gaq.push(['_trackEvent', 'Operate', 'Facebook', '']);
  });
  $(".box-nav .nav-ext").click(function() {
    return _gaq.push(['_trackEvent', 'Operate', 'Extension', '']);
  });
  $(".box-nav .nav-logout").click(function() {
    var data;

    _gaq.push(['_trackEvent', 'Operate', 'logout', sys.user]);
    data = {
      _: Math.random(),
      user: 'logout',
      pwd: 'logout'
    };
    sys.user = null;
    $('.login').removeClass('invalid');
    return $.ajax("http://" + ADDRESS + PATH + API.LOGIN + "?logout", {
      type: "POST",
      data: data,
      dataType: "json",
      timeout: 4000
    });
  });
  $('#dialog-chrome a').click(function() {
    _gaq.push(['_trackEvent', 'Check', 'Is not chrome', $('#dialog-chrome .donot').is(':checked')]);
    $('body').removeClass('no-chrome');
    if ($('#dialog-chrome .donot').is(':checked')) {
      $.cookie('donot-chrome', '1', {
        expiress: 365
      });
    }
    return true;
  });
  if (!($.browser.chrome === true || ($.cookie('donot-chrome') != null))) {
    $('body').addClass('no-chrome');
  }
  $('#dialog-ext a').click(function() {
    _gaq.push(['_trackEvent', 'Check', 'Not has ext', $('#dialog-ext .donot').is(':checked')]);
    $('body').addClass('has-ext');
    if ($('#dialog-ext .donot').is(':checked')) {
      $.cookie('donot-ext', '1', {
        expiress: 365
      });
    }
    return true;
  });
  if ($.browser.chrome !== true || ($.cookie('donot-ext') != null)) {
    $('body').addClass('has-ext');
  }
  $('#dialog-qpkg a, #dialog-error a').click(function() {
    $('body').removeClass('has-error no-qpkg');
    return true;
  });
  sys_status = function(listen) {
    return $.ajax("http://" + ADDRESS + PATH + API.INFO, {
      type: "POST",
      dataType: "json",
      data: {
        it: 'server'
      },
      timeout: 14000,
      success: function(res) {
        if (res.server != null) {
          if (res.server.qpkg_status !== 'TRUE') {
            $('body').addClass('no-qpkg');
          } else if (res.server.process_status !== 1 || res.server.server_status === 0) {
            $('body').addClass('has-error');
          } else {
            $('body').removeClass('no-qpkg has-error');
          }
          switch (res.server.server_status) {
            case 0:
              $('#control').attr('class', 'server-stopped');
              break;
            case 1:
              $('#control').attr('class', 'server-running');
              break;
            case 2:
              $('#control').attr('class', 'server-paused');
          }
        } else {
          $('body').addClass('has-error');
        }
        if (listen !== false) {
          return setTimeout(sys_status, 10000);
        }
      },
      error: function(xhr, ajaxOptions, thrownError) {
        if (listen !== false) {
          return setTimeout(sys_status, 10000);
        }
      }
    });
  };
  sys_status();
  sys_user = function(listen) {
    return $.ajax("http://" + ADDRESS + PATH + API.LOGIN + "?check", {
      type: "POST",
      dataType: "json",
      timeout: 14000,
      success: function(res) {
        if (res.status === "true") {
          sys.user = res.user;
        } else {
          $('body').addClass('guest');
        }
        if (listen !== false) {
          return setTimeout(sys_user, 10000);
        }
      },
      error: function(xhr, ajaxOptions, thrownError) {
        if (listen !== false) {
          return setTimeout(sys_user, 10000);
        }
      }
    });
  };
  sys_user();
  $.task.setListen(TASK.GROUP_CANCEL, function(tid) {
    if (tid.length > 0) {
      return req_server("cancel_task", {
        tid: tid
      });
    }
  });
  $.task.setListen(TASK.GROUP_RELOAD, function(tid) {
    if (tid.length > 0) {
      return req_server("redownload_task", {
        tid: tid
      });
    }
  });
  $.task.setListen(TASK.TASK_CANCEL, function(tid) {
    if (tid != null) {
      return req_server("cancel_task", {
        tid: [tid]
      });
    }
  });
  $.task.setListen(TASK.TASK_RELOAD, function(tid) {
    if (tid != null) {
      return req_server("redownload_task", {
        tid: [tid]
      });
    }
  });
  login_action = function() {
    var data, pwd, user;

    user = $('#username').val();
    pwd = $('#password').val();
    data = {
      _: Math.random(),
      user: user,
      pwd: pwd
    };
    $('.login').removeClass('invalid');
    $('.login').addClass('proceed');
    return $.ajax("http://" + ADDRESS + PATH + API.LOGIN, {
      type: "POST",
      data: data,
      dataType: "json",
      timeout: 4000,
      success: function(res) {
        if (String(res) === 'true') {
          $('body').removeClass('guest');
        } else {
          $('.login').addClass('invalid');
          $('body').addClass('guest');
        }
        sys.user = user;
        return $('.login').removeClass('proceed');
      },
      error: function(xhr, ajaxOptions, thrownError) {
        $('.login').removeClass('proceed');
        return $('body').addClass('guest');
      }
    });
  };
  $('.login').keypress(function(e) {
    var key;

    key = e.keyCode || e.which;
    if (key === 13) {
      return login_action();
    }
  });
  $('#login-submit').click(login_action);
  $('.login .remember').click(function() {
    return $(this).toggleClass('checked');
  });
  $("#control").click(function() {
    sys_status(false);
    if ($(this).hasClass('server-stopped')) {
      return false;
    }
    req_server('pause_server');
    return $(this).toggleClass("server-paused");
  });
  /*
  System load
  */

  load = function() {
    if (sys.watch != null) {
      clearTimeout(sys.watch);
      delete sys.watch;
    }
    return sys.watch = setTimeout(watch_action, WATCH_TIME);
  };
  return load();
});

/*
HappyGet App
*/


hg2App = angular.module('hg2', []);

hg2App.filter('startFrom', function() {
  return function(input, start) {
    return input.slice(start);
  };
});

RootCtrl = function($scope) {
  $scope.searchActive = 'inactive';
  $scope.guest = false;
  $scope.play = function(video) {
    return $scope.$broadcast('play', video);
  };
  $scope.updatePlaylist = function(playlist) {
    return $scope.$broadcast('updatePlaylist', playlist);
  };
  return $scope.$on('search', function(e, enable) {
    $scope.searchActive = enable ? 'active' : 'inactive';
    return $scope.$apply();
  });
};

/*
*/


/*
YouTube Search
*/


SearchCtrl = function($scope, $rootScope, $http) {
  delete $http.defaults.headers.common['X-Requested-With'];
  $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
  $scope.items = [];
  $scope.qVal = '';
  $scope.page = 1;
  $scope.pageTotal = 1;
  $scope.pageStart = 0;
  $scope.pageCount = 8;
  $scope.nextPageToken = null;
  $scope.$watch('page', function(newValue, oldValue) {
    if (!$scope.nextPageToken) {
      return;
    }
    if ($scope.page > $scope.items.length / $scope.pageCount - 3) {
      return $scope.request($scope.nextPageToken);
    }
  });
  $scope.prevPage = function() {
    if ($scope.page > 1) {
      $scope.page -= 1;
    }
    return $scope.pageStart = ($scope.page - 1) * $scope.pageCount;
  };
  $scope.nextPage = function() {
    if ($scope.page < $scope.pageTotal) {
      $scope.page += 1;
    }
    return $scope.pageStart = ($scope.page - 1) * $scope.pageCount;
  };
  $scope.request = function(page) {
    var params;

    params = {
      key: 'AIzaSyCpOMFgf1ZKObU6zyAjckcLrMuD56ZVzfM',
      q: $scope.qVal,
      part: 'snippet',
      maxResults: 50
    };
    if (page) {
      params.pageToken = page;
    }
    return $http({
      method: 'GET',
      url: 'https://www.googleapis.com/youtube/v3/search',
      params: params
    }).success(function(res, status, headers, config) {
      $scope.pageTotal = Math.ceil(res.pageInfo.totalResults / $scope.pageCount);
      $.each(res.items, function(i, item) {
        return $scope.items.push({
          vid: item.id.videoId,
          title: item.snippet.title,
          thumb: item.snippet.thumbnails["default"].url,
          bigthumb: item.snippet.thumbnails.high.url,
          availableQuality: null,
          quality: {
            Original: false,
            HD1080: false,
            HD720: false,
            Medium: false,
            Audio: true
          },
          url: 'http://www.youtube.com/watch?v=' + item.id.videoId
        });
      });
      return $scope.nextPageToken = res.nextPageToken ? res.nextPageToken : null;
    });
  };
  $scope.search = function() {
    $scope.updatePlaylist($scope.qVal);
    $scope.items = [];
    $scope.page = 1;
    $scope.pageTotal = 1;
    $scope.pageStart = 0;
    $scope.nextPageToken = null;
    $scope.request();
    return $scope.$emit('search', true);
  };
  $scope.cancel = function() {
    $scope.$emit('search', false);
    $scope.items = [];
    $scope.qVal = '';
    $scope.page = 1;
    $scope.pageTotal = 1;
    $scope.pageStart = 0;
    return $scope.nextPageToken = null;
  };
  return $scope.look = function(index) {
    var item;

    item = $scope.items[index + $scope.pageStart];
    return $scope.play(item);
  };
};

/*
Player
*/


PlayerCtrl = function($scope, $timeout, $http) {
  $scope.video = {};
  $scope.playlist = '';
  $scope.player = false;
  $scope.$on('updatePlaylist', function(e, playlist) {
    return $scope.playlist = playlist;
  });
  $scope.$on('play', function(e, video) {
    $scope.video = video;
    $scope.player = true;
    swfobject.embedSWF('http://www.youtube.com/v/' + video.vid + '?enablejsapi=1&playerapiid=ytplayer&version=3&autoplay=1', "ytplayer", "640", "360", "8", null, null, {
      allowScriptAccess: "always"
    });
    if (!video.availableQuality) {
      return (function() {
        var getAvailableQualityLevels;

        getAvailableQualityLevels = arguments.callee;
        return $timeout((function() {
          var quality;

          quality = typeof ytplayer.getAvailableQualityLevels === "function" ? ytplayer.getAvailableQualityLevels() : void 0;
          if ((quality != null ? quality.length : void 0) > 0) {
            return $scope.video.availableQuality = {
              HD1080: quality.indexOf('hd1080') ? true : void 0,
              HD720: quality.indexOf('hd720') ? true : void 0,
              Medium: quality.indexOf('medium') ? true : void 0,
              Original: quality.indexOf('highres') ? true : void 0
            };
          } else {
            return getAvailableQualityLevels();
          }
        }), 1000);
      })();
    }
  });
  $scope.download = function(all) {
    var limit, quality;

    limit = 1;
    quality = [];
    if ($scope.video.quality.Audio) {
      quality.push('Audio');
      limit += 1;
    }
    if (all) {
      quality.push('All');
    } else {
      if ($scope.video.quality.Original) {
        quality.push('Original');
      }
      if ($scope.video.quality.HD1080) {
        quality.push('1080P');
      }
      if ($scope.video.quality.HD720) {
        quality.push('720P');
      }
      if ($scope.video.quality.Medium) {
        quality.push('360P');
      }
      if (quality.length < limit) {
        angular.forEach($scope.video.availableQuality, function(value, key) {
          quality.push(key);
          return $scope.video.quality[key] = true;
        });
      }
    }
    $scope.close();
    return $http({
      method: 'POST',
      url: "/hg2/api2/add_task.php",
      data: $.param({
        sourceType: 'youtube',
        items: [
          {
            id: $scope.video.vid,
            title: $scope.video.title,
            url: $scope.video.url,
            thumb: $scope.video.thumb,
            bigthumb: $scope.video.bigthumb,
            playlist: $scope.playlist,
            quality: quality
          }
        ]
      })
    });
  };
  return $scope.close = function() {
    $scope.player = false;
    return ytplayer.stopVideo();
  };
};

$(function() {
  $(window).resize(function() {
    $(".task .wrapper-list").css("min-height", $(window).height() - 203);
    return $("#group .wrapper-overflow, #group .wrapper-list").height($(window).height() - 203);
  });
  return $(window).resize();
});

var TASK,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

TASK = {
  TASK_CANCEL: 0,
  TASK_RELOAD: 1,
  GROUP_CANCEL: 2,
  GROUP_RELOAD: 3
};

$.task = (function() {
  /*
  Task Static Variable
  */

  var GroupData, TaskData, doc, group, listen, task, task_obj;

  doc = {
    group: {
      sample: null,
      download: null,
      list: null,
      cursor: null,
      filter: null
    },
    task: {
      sample: null,
      download: null,
      list: null,
      cursor: null,
      filter: null
    }
  };
  listen = [];
  /*
  GroupData Object
  */

  GroupData = (function(_super) {
    __extends(GroupData, _super);

    function GroupData(data) {
      if ((data instanceof jQuery) && $(data).data("GroupData")) {
        return $(data).data("GroupData");
      }
      data.tag = null;
      this.dltag = null;
      this.sum = [0, 0, 0, 0, 0, 0];
      Object.defineProperty(this, 'name', {
        get: function() {
          return data.name;
        }
      });
      Object.defineProperty(this, 'tag', {
        get: function() {
          var temp, val, _i, _len, _ref;

          if (data.tag == null) {
            data.tag = doc.group.sample.clone();
            data.tag.data("GroupData", this).attr("key", data.name);
            $(".name", data.tag).text(data.name);
            _ref = ['thumb', 'owner', 'src_type', 'status'];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              val = _ref[_i];
              temp = this[val];
              delete data[val];
              this[val] = temp;
            }
          }
          return data.tag;
        }
      });
      Object.defineProperty(this, 'thumb', {
        get: function() {
          return data.thumb || '';
        },
        set: function(val) {
          data.thumb = val;
          $(".thumb .img", this.tag).empty().append($('<img onerror="this.src=\'data:image/gif;base64,R0lGODlhAwADAIAAAAAAAP///yH5BAEHAAEALAAAAAADAAMAAAIDjH8FADs=\'" />').attr('src', val));
          if (this.dltag != null) {
            return $(".thumb .img", this.dltag).empty().append($('<img onerror="this.src=\'data:image/gif;base64,R0lGODlhAwADAIAAAAAAAP///yH5BAEHAAEALAAAAAADAAMAAAIDjH8FADs=\'" />').attr('src', val));
          }
        }
      });
      Object.defineProperty(this, 'owner', {
        get: function() {
          return data.owner || '';
        },
        set: function(val) {
          var temp;

          if (val == null) {
            return;
          }
          val = val.toLowerCase();
          if ((this.owner != null) && this.owner.toLowerCase() === val) {
            return;
          }
          temp = this.owner;
          if (this.owner) {
            data.owner = 'multiple';
          } else {
            data.owner = val;
          }
          this.tag.removeClass('owner-' + temp);
          this.tag.addClass('owner-' + this.owner);
          if (this.dltag != null) {
            this.dltag.removeClass('owner-' + temp);
            this.dltag.addClass('owner-' + this.owner);
          }
          return group.owner = this.owner;
        }
      });
      Object.defineProperty(this, 'src_type', {
        get: function() {
          return data.src_type;
        },
        set: function(val) {
          var temp;

          if (val == null) {
            return;
          }
          val = val.toLowerCase();
          if ((this.src_type != null) && this.src_type.toLowerCase() === val) {
            return;
          }
          temp = this.src_type;
          if (this.src_type) {
            data.src_type = 'multiple';
          } else {
            data.src_type = val;
          }
          this.tag.removeClass('src-' + temp);
          this.tag.addClass('src-' + this.src_type);
          if (this.dltag != null) {
            this.dltag.removeClass('src-' + temp);
            this.dltag.addClass('src-' + this.src_type);
          }
          return group.src = this.src_type;
        }
      });
      Object.defineProperty(this, 'status', {
        get: function() {
          return data.status;
        },
        set: function(val) {
          this.tag.removeClass('status-' + STATUS_NAME[data.status]);
          this.tag.addClass('status-' + STATUS_NAME[val]);
          if (this.dltag != null) {
            this.dltag.removeClass('status-' + STATUS_NAME[data.status]);
            this.dltag.addClass('status-' + STATUS_NAME[val]);
          }
          data.status = val;
          $(".total", this.tag).text(this.sum[STATUS.COMPLETE] + " / " + this.length);
          if (this.dltag != null) {
            return $(".total", this.dltag).text(this.sum[STATUS.COMPLETE] + " / " + this.length);
          }
        }
      });
    }

    GroupData.prototype.push = function(task) {
      Array.prototype.push.call(this, task);
      this.toggle(false, task.status);
      if (task.thumb != null) {
        this.thumb = task.thumb;
      }
      this.owner = task.owner;
      this.src_type = task.src_type;
      return this;
    };

    GroupData.prototype.del = function(task_data) {
      var index;

      index = $.inArray(task_data, this);
      if (index > -1) {
        this.splice(index, 1);
        this.toggle(task_data.status, false);
        if (!(this.length > 0)) {
          group.del(this);
          $(this.tag).fadeOut(500, function() {
            return $(this).remove();
          });
          if (this.dltag != null) {
            $(this.dltag).fadeOut(500, function() {
              return $(this).remove();
            });
          }
        }
      }
      return this;
    };

    GroupData.prototype.toggle = function(from, to) {
      if ((from != null) && from !== false) {
        this.sum[from]--;
      }
      if ((to != null) && to !== false) {
        this.sum[to]++;
      }
      if (this.sum[STATUS.WAIT] + this.sum[STATUS.DOWNLOAD] < 1) {
        if (this.sum[STATUS.FAIL] > 0) {
          return this.status = STATUS.FAIL;
        } else if (this.sum[STATUS.COMPLETE] > 0) {
          return this.status = STATUS.COMPLETE;
        } else {
          return this.status = STATUS.CANCEL;
        }
      } else {
        if (this.sum[STATUS.DOWNLOAD] > 0) {
          return this.status = STATUS.DOWNLOAD;
        } else {
          return this.status = STATUS.WAIT;
        }
      }
    };

    return GroupData;

  })(Array);
  /*
  Group Object
  */

  $.group = group = new ((function(_super) {
    var obj;

    __extends(_Class, _super);

    obj = {
      index: 0,
      data: {},
      filter: {
        owner: null,
        owner_list: [],
        src: null,
        src_list: []
      }
    };

    function _Class() {
      Object.defineProperty(this, 'owner', {
        get: function() {
          return obj.filter.owner;
        },
        set: function(val) {
          if (val == null) {
            return;
          }
          val = val.toLowerCase();
          if (!(obj.filter.owner_list.indexOf(val) < 0)) {
            return;
          }
          obj.filter.owner_list.push(val);
          $("#filter-owner select", doc.group.filter).append($("<option />").text(val));
          return $('#filter').html($('#filter').html() + ' #group .filter-owner-' + val + ' .item:not(.owner-' + val + '){ height: 0px;border: none;}');
        }
      });
      Object.defineProperty(this, 'src', {
        get: function() {
          return obj.filter.src;
        },
        set: function(val) {
          if (val == null) {
            return;
          }
          val = val.toLowerCase();
          if (!(obj.filter.src_list.indexOf(val) < 0)) {
            return;
          }
          obj.filter.src_list.push(val);
          $("#filter-src select", doc.group.filter).append($("<option />").text(val));
          return $('#filter').html($('#filter').html() + ' #group .filter-src-' + val + ' .item:not(.src-' + val + '){ height: 0px;border: none;}');
        }
      });
    }

    _Class.prototype.push = function(item) {
      item = new GroupData(item);
      obj.data[item.name] = item;
      Array.prototype.push.call(this, item);
      if (this.length === 1) {
        task.toggleGroup(item);
      }
      return item;
    };

    _Class.prototype.get = function(name) {
      return obj.data[name];
    };

    _Class.prototype.del = function(group_data) {
      var index;

      delete obj.data[group_data.name];
      index = $.inArray(group_data, this);
      if (index > -1) {
        this.splice(index, 1);
      }
      return this;
    };

    _Class.prototype.reset = function() {
      obj.index = 0;
      obj.data = {};
      while (this.length > 0) {
        this.pop();
      }
      obj.filter = {
        owner: null,
        owner_list: [],
        src: null,
        src_list: []
      };
      $(".item", doc.group.list).remove();
      $(".item", doc.group.download).remove();
      $("#filter-owner option", doc.group.filter).slice(1).remove();
      $("#filter-src option", doc.group.filter).slice(1).remove();
      $('#filter').empty();
      this.owner = 'multiple';
      this.src = 'multiple';
      return this;
    };

    _Class.prototype.draw = function() {
      var draw, top;

      if (obj.index >= this.length) {
        return obj.index = this.length;
      }
      top = doc.group.cursor.offset().top - $(window).scrollTop();
      if (top < ($(window).height() * 1.5)) {
        draw = [];
        while (true) {
          draw.push(this[obj.index].tag);
          obj.index++;
          if (!(obj.index % 5 > 0 && obj.index < this.length)) {
            break;
          }
        }
      }
      doc.group.cursor.before(draw);
      return this;
    };

    return _Class;

  })(Array));
  /*
  TaskData Object
  */

  TaskData = (function() {
    TaskData.prototype.dltag = null;

    function TaskData(data) {
      if ((data instanceof jQuery) && $(data).data("TaskData")) {
        return $(data).data("TaskData");
      }
      data.tid = parseInt(data.tid);
      data.status = parseInt(data.status);
      Object.defineProperty(this, "tid", {
        value: data.tid,
        writeable: false
      });
      Object.defineProperty(this, "playlist", {
        value: data.playlist,
        writeable: false
      });
      Object.defineProperty(this, "name", {
        value: data.name,
        writeable: false
      });
      Object.defineProperty(this, "owner", {
        value: data.owner,
        writeable: false
      });
      Object.defineProperty(this, "src_type", {
        value: data.src_type,
        writeable: false
      });
      Object.defineProperty(this, "src", {
        value: data.src,
        writeable: false
      });
      Object.defineProperty(this, "time", {
        get: function() {
          return data.time;
        },
        set: function(val) {
          return data.time = parseInt(val);
        }
      });
      Object.defineProperty(this, "tag", {
        get: function() {
          var temp, val, _i, _len, _ref;

          if (data.tag == null) {
            data.tag = doc.task.sample.clone();
            this.tag.data("TaskData", this).attr("tid", this.tid);
            this.tag.addClass('src-' + data.src_type.toLowerCase());
            $(".thumb", this.tag).attr('href', this.src || '#');
            $(".name", this.tag).text(this.name);
            $(".owner", this.tag).text(this.owner);
            this.tag.addClass('status-' + STATUS_NAME[this.status]);
            _ref = ['added_time', 'thumb', 'quality', 'size', 'dl_size', 'sub_task', 'sub_task_ok'];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              val = _ref[_i];
              temp = this[val];
              data[val] = null;
              this[val] = temp;
            }
          }
          return data.tag;
        }
      });
      Object.defineProperty(this, "status", {
        get: function() {
          return data.status;
        },
        set: function(val) {
          var belong, temp;

          temp = this.status;
          data.status = parseInt(val);
          if (this.status !== temp) {
            belong = group.get(this.playlist);
            belong.toggle(temp, this.status);
          }
          if (this.status === STATUS.DOWNLOAD) {
            task.download = this;
          } else if (task.download === this) {
            task.download = false;
          }
          this.tag.removeClass('status-' + STATUS_NAME[temp]);
          this.tag.addClass('status-' + STATUS_NAME[this.status]);
          if (this.dltag != null) {
            this.dltag.removeClass('status-' + STATUS_NAME[temp]);
            return this.dltag.addClass('status-' + STATUS_NAME[this.status]);
          }
        }
      });
      Object.defineProperty(this, "quality", {
        get: function() {
          return data.quality;
        },
        set: function(val) {
          var item, quality, _i, _len;

          quality = '';
          if (val != null) {
            for (_i = 0, _len = val.length; _i < _len; _i++) {
              item = val[_i];
              if (item == null) {
                continue;
              }
              item = item.toLowerCase();
              if (quality !== '' && quality !== item) {
                quality = 'multi';
                break;
              }
              quality = item;
            }
          }
          $(".quality", this.tag).attr('class', 'quality quality-' + quality);
          return data.quality = val;
        }
      });
      Object.defineProperty(this, "added_time", {
        get: function() {
          return data.added_time;
        },
        set: function(val) {
          $(".time", this.tag).text(new Date(val * 1000).toFormat("yyyy-MM-dd"));
          if (this.dltag != null) {
            $(".time", this.dltag).text(new Date(val * 1000).toFormat("yyyy-MM-dd"));
          }
          return data.added_time = val;
        }
      });
      Object.defineProperty(this, "thumb", {
        get: function() {
          return data.thumb;
        },
        set: function(val) {
          var _ref;

          if (val === this.thumb) {
            return;
          }
          if ((_ref = group.get(this.playlist)) != null) {
            _ref.thumb = val;
          }
          $('.thumb .img', this.tag).empty().append($('<img onerror="this.src=\'data:image/gif;base64,R0lGODlhAwADAIAAAAAAAP///yH5BAEHAAEALAAAAAADAAMAAAIDjH8FADs=\'" />').attr('src', val));
          if (this.dltag != null) {
            $('.thumb .img', this.dltag).empty().append($('<img onerror="this.src=\'data:image/gif;base64,R0lGODlhAwADAIAAAAAAAP///yH5BAEHAAEALAAAAAADAAMAAAIDjH8FADs=\'" />').attr('src', val));
          }
          return data.thumb = val;
        }
      });
      Object.defineProperty(this, "size", {
        get: function() {
          return data.size;
        },
        set: function(val) {
          data.size = parseInt(val) || 0;
          if (this.size < 1) {
            $(".est-size, dl-size", this.tag).empty();
            if (this.dltag) {
              return $(".est-size, dl-size", this.dltag).empty();
            }
          } else {
            $(".est-size", this.tag).html('&nbsp;/&nbsp;' + $.filesize(this.size));
            if (this.dltag) {
              return $(".est-size", this.dltag).html('&nbsp;/&nbsp;' + $.filesize(this.size));
            }
          }
        }
      });
      Object.defineProperty(this, "dl_size", {
        get: function() {
          return data.dl_size;
        },
        set: function(val) {
          data.dl_size = parseInt(val) || 0;
          $(".dl-size", this.tag).text($.filesize(this.dl_size));
          if (this.dltag) {
            $(".dl-size", this.dltag).text($.filesize(this.dl_size));
          }
          $(".bar", this.tag).width((this.dl_size / this.size * 100) + "%");
          if (this.dltag) {
            return $(".bar", this.dltag).width((this.dl_size / this.size * 100) + "%");
          }
        }
      });
      Object.defineProperty(this, "sub_task", {
        get: function() {
          return data.sub_task || 0;
        },
        set: function(val) {
          data.sub_task = parseInt(val) || 0;
          if (this.sub_task > 0) {
            $(this.tag).addClass('has-sub');
            $(".total-sub", this.tag).html('&nbsp;/&nbsp;' + this.sub_task);
            if (this.dltag) {
              $(".total-sub", this.dltag).html('&nbsp;/&nbsp;' + this.sub_task);
            }
            $(".bar", this.tag).width((this.sub_task_ok / this.sub_task * 100) + "%");
            if (this.dltag) {
              return $(".bar", this.dltag).width((this.sub_task_ok / this.sub_task * 100) + "%");
            }
          }
        }
      });
      Object.defineProperty(this, "sub_task_ok", {
        get: function() {
          return data.sub_task_ok || 0;
        },
        set: function(val) {
          data.sub_task_ok = parseInt(val) || 0;
          $(".ok-sub", this.tag).text(this.sub_task_ok);
          if (this.dltag) {
            $(".ok-sub", this.dltag).text(this.sub_task_ok);
          }
          if (this.sub_task > 0) {
            $(".bar", this.tag).width((this.sub_task_ok / this.sub_task * 100) + "%");
            if (this.dltag) {
              return $(".bar", this.dltag).width((this.sub_task_ok / this.sub_task * 100) + "%");
            }
          }
        }
      });
      this;
    }

    TaskData.prototype.del = function() {
      $(this.tag).fadeOut(500, function() {
        return $(this).remove();
      });
      if (this.dltag) {
        $(this.dltag).fadeOut(500, function() {
          return $(this).remove();
        });
      }
      delete task[this.tid];
      return group.get(this.playlist).del(this);
    };

    return TaskData;

  })();
  /*
  Task Object
  */

  task = [];
  task_obj = {
    index: 0,
    download: false,
    group: null,
    auto_review: null
  };
  Object.defineProperty(task, 'download', {
    get: function() {
      return task_obj.download;
    },
    set: function(task_data) {
      var belong, temp;

      temp = this.download;
      if (temp === task_data) {
        return;
      }
      if (temp !== false) {
        if (temp.status === STATUS.DOWNLOAD) {
          temp.time = new Date().getTime() / 1000;
          temp.status = STATUS.COMPLETE;
        }
        if (temp.dltag != null) {
          temp.dltag.remove();
          temp.dltag = null;
        }
        belong = group.get(temp.playlist);
        if (belong.dltag != null) {
          belong.dltag.remove();
          belong.dltag = null;
        }
      }
      if (task_data) {
        if (!task_data.dltag) {
          task_data.dltag = task_data.tag.clone();
        }
        if (!$('.item', doc.task.download).is(task_data.dltag)) {
          doc.task.download.append(task_data.dltag);
        }
        belong = group.get(task_data.playlist);
        if (belong.dltag == null) {
          belong.dltag = belong.tag.clone();
        }
        if (!$('.item', doc.group.download).is(belong.dltag)) {
          doc.group.download.append(belong.dltag);
        }
      }
      return task_obj.download = task_data;
    }
  });
  task.push = function(data) {
    return $(data).each(function() {
      var belong, item;

      item = new TaskData(this);
      task[item.tid] = item;
      belong = group.get(item.playlist);
      if (!belong) {
        belong = group.push({
          name: item.playlist,
          owner: item.owner,
          thumb: item.thumb,
          src: item.src_type
        });
      }
      return belong.push(item);
    });
  };
  task.reset = function() {
    var download;

    while (this.length > 0) {
      this.pop();
    }
    download = false;
    group.reset();
    this.toggleGroup();
    $(".item", doc.task.download).remove();
    return this;
  };
  task.toggleGroup = function(playlist) {
    var target;

    target = null;
    task_obj.group = playlist != null ? playlist : null;
    if (task_obj.auto_review != null) {
      clearInterval(task_obj.auto_review);
      delete task_obj.auto_review;
    }
    $(".item", doc.task.list).remove();
    task_obj.index = 0;
    return task_obj.auto_review = setInterval(function() {
      group.draw();
      return task.draw();
    }, 300);
  };
  task.draw = function() {
    var draw, top;

    if (!((task_obj.group != null) && task_obj.index < task_obj.group.length)) {
      return this;
    }
    top = doc.task.cursor.offset().top - $(window).scrollTop();
    if (top < ($(window).height() * 1.5)) {
      draw = [];
      while (true) {
        draw.push(task_obj.group[task_obj.index].tag);
        task_obj.index++;
        if (!(task_obj.index % 5 > 0 && task_obj.index < task_obj.group.length)) {
          break;
        }
      }
      return doc.task.cursor.before(draw);
    }
  };
  task.setListen = function(event_code, action) {
    return listen[event_code] = action;
  };
  $(function() {
    var group_wrap, task_wrap;

    group_wrap = $('#group');
    doc.group = {
      download: $('.wrapper-download .download', group_wrap),
      list: $('.wrapper-list', group_wrap),
      sample: $('.item', group_wrap).detach(),
      cursor: $('.wrapper-list .none', group_wrap),
      filter: $('.wrapper-filter .filter', group_wrap)
    };
    task_wrap = $('.task');
    doc.task = {
      download: $('.wrapper-download .download', task_wrap),
      list: $('.wrapper-list', task_wrap),
      sample: $('.item', task_wrap).detach(),
      cursor: $('.wrapper-list .none', task_wrap),
      filter: $('.wrapper-filter .filter', task_wrap)
    };
    task.reset();
    /*
    Event
    */

    $(".item", group_wrap).live('click', function() {
      var temp;

      temp = group.get($(this).attr("key"));
      _gaq.push(['_trackEvent', 'Group', 'See', temp.name]);
      return task.toggleGroup(temp);
    });
    $(".cancel", group_wrap).live('click', function() {
      var group_data, target, wrap, _name;

      wrap = $(this).parents(".item:first");
      group_data = new GroupData(wrap);
      _gaq.push(['_trackEvent', 'Group', 'Cancel', group_data.name]);
      target = [];
      $(group_data).each(function() {
        switch (this.status) {
          case STATUS.CANCEL:
          case STATUS.COMPLETE:
            break;
          default:
            this.status = STATUS.CANCEL;
            this.time = new Date().getTime() / 1000;
            return target.push(this.tid);
        }
      });
      return typeof listen[_name = TASK.GROUP_CANCEL] === "function" ? listen[_name](target) : void 0;
    });
    $(".reload", group_wrap).live('click', function() {
      var group_data, target, wrap, _name;

      wrap = $(this).parents(".item:first");
      group_data = new GroupData(wrap);
      _gaq.push(['_trackEvent', 'Group', 'Reload', group_data.name]);
      target = [];
      $(group_data).each(function() {
        switch (this.status) {
          case STATUS.RELOAD:
          case STATUS.WAIT:
            break;
          default:
            this.dl_size = 0;
            this.sub_task_ok = 0;
            this.status = STATUS.RELOAD;
            this.time = new Date().getTime() / 1000;
            return target.push(this.tid);
        }
      });
      return typeof listen[_name = TASK.GROUP_RELOAD] === "function" ? listen[_name](target) : void 0;
    });
    $("select", doc.group.filter).on("change", function() {
      var id, item, reg, selected, target, val, _i, _len, _ref;

      id = $(this).parent().attr("id");
      reg = new RegExp('^' + id + '-.+');
      selected = $("option:selected", this);
      val = selected.val();
      target = [];
      _gaq.push(['_trackEvent', 'Group', id, val]);
      $(this).prev().text(selected.text());
      _ref = $(doc.group.list).attr('class').split(' ');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        if (reg.exec(item)) {
          target.push(item);
        }
      }
      if (target.length > 0) {
        $(doc.group.list).removeClass(target.join(' '));
      }
      if (!selected.is(":first-child")) {
        return $(doc.group.list).addClass(id + '-' + val);
      }
    }).change();
    $(".cancel", task_wrap).live('click', function() {
      var tid, wrap, _name;

      wrap = $(this).parents(".item:first");
      tid = wrap.attr("tid");
      _gaq.push(['_trackEvent', 'Task', 'Cancel', task[tid].name]);
      if (task[tid]) {
        task[tid].status = STATUS.CANCEL;
        task[tid].time = new Date().getTime() / 1000;
      }
      return typeof listen[_name = TASK.TASK_CANCEL] === "function" ? listen[_name](tid) : void 0;
    });
    $(".reload", task_wrap).live('click', function() {
      var tid, wrap, _name;

      wrap = $(this).parents(".item:first");
      tid = wrap.attr("tid");
      _gaq.push(['_trackEvent', 'Task', 'Reload', task[tid].name]);
      if (task[tid]) {
        task[tid].dl_size = 0;
        task[tid].sub_task_ok = 0;
        task[tid].status = STATUS.RELOAD;
        task[tid].time = new Date().getTime() / 1000;
      }
      return typeof listen[_name = TASK.TASK_RELOAD] === "function" ? listen[_name](tid) : void 0;
    });
    return $(doc.task.filter).delegate("li", 'click', function() {
      var item, reg, target, _i, _len, _ref;

      reg = new RegExp('^filter-status-.+');
      target = [];
      _gaq.push(['_trackEvent', 'Task', 'Status', $(this).attr('for')]);
      _ref = $(doc.task.list).attr('class').split(' ');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        if (reg.exec(item)) {
          target.push(item);
        }
      }
      if (target.length > 0) {
        $(doc.task.list).removeClass(target.join(' '));
      }
      $(doc.task.list).addClass('filter-status-' + $(this).attr('for'));
      $(this).addClass("active");
      return $(this).siblings().removeClass("active");
    });
  });
  return task;
})();
