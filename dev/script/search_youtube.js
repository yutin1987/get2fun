var ADDRESS, API, LoginCtrl, MainCtrl, PATH, PlayerCtrl, SearchCtrl, WATCH_TIME, hg2App;

ADDRESS = location.host;

PATH = '/hg2/';

API = {
  TASK: 'api/dls5.php',
  LOGIN: 'api2/login2.php',
  INFO: 'api2/info.php',
  YT_QUALITY: 'api4fe/ytquality.php'
};

WATCH_TIME = 1000;

$(function() {
  var body, os, userAgent;

  userAgent = navigator.userAgent;
  body = $('body');
  os = /Android|webOS|iPhone|iPad|iPod|BlackBerry|PlayBook|Windows|Macintosh/i.exec(userAgent);
  os = os[0].toLowerCase();
  body.addClass('device-' + os);
  if (/Mobile/i.exec(userAgent) || $(window).width() < 767) {
    body.addClass('device-mobile');
  }
  if (os === 'ipad') {
    return body.removeClass('device-mobile');
  }
});

hg2App = angular.module('hg2', []);

hg2App.filter('startFrom', function() {
  return function(input, start) {
    return input.slice(start);
  };
});

MainCtrl = function($scope, $timeout) {
  var resize, sys_info, sys_user;

  $scope.admin = false;
  $scope.user = null;
  $scope.serverStatus = 'stopped';
  $scope.width = 0;
  $scope.height = 0;
  resize = function() {
    $scope.width = $(document).width();
    return $scope.height = $(document).height();
  };
  (function() {
    resize();
    return $timeout(arguments.callee, 3000);
  })();
  (sys_user = function() {
    return $.ajax("http://" + ADDRESS + PATH + API.LOGIN + "?check", {
      type: "POST",
      dataType: "json",
      timeout: 14000
    }).always(function(res, status) {
      if (status === 'success' && res.status === "true") {
        $scope.user = res.user;
      } else {
        $scope.user = null;
      }
      $scope.$apply();
      return $timeout(sys_user, 5000);
    });
  })();
  (sys_info = function() {
    return $.ajax("http://" + ADDRESS + PATH + API.INFO, {
      type: "POST",
      dataType: "json",
      data: {
        it: 'server'
      },
      timeout: 14000
    }).always(function(res, status) {
      var _ref;

      if (status === 'success' && ((_ref = res.server) != null ? _ref.server_status : void 0) !== 0) {
        switch (res.server.server_status) {
          case 1:
            $scope.serverStatus = 'running';
            break;
          case 2:
            $scope.serverStatus = 'paused';
        }
      } else {
        $scope.serverStatus = 'stopped';
      }
      $scope.$apply();
      return $timeout(sys_info, 10000);
    });
  })();
  $scope.play = function(video) {
    return $scope.$broadcast('play', video);
  };
  $scope.logout = function() {
    var data;

    $scope.admin = false;
    $scope.user = null;
    data = {
      _: Math.random(),
      user: 'logout',
      pwd: 'logout'
    };
    return $.ajax("http://" + ADDRESS + PATH + API.LOGIN + "?logout", {
      type: "POST",
      data: data,
      dataType: "json",
      timeout: 4000
    });
  };
  $scope.updatePlaylist = function(playlist) {
    return $scope.$broadcast('updatePlaylist', playlist);
  };
  $scope.updateUser = function(user, admin) {
    $scope.user = user;
    return $scope.admin = admin;
  };
  return $scope.$on('download', function(e, video, playlist, quality) {
    if (video.download) {
      return;
    }
    video.download = true;
    $scope.$broadcast('downloaded', video);
    return $.ajax({
      type: 'POST',
      url: "/hg2/api2/add_task.php",
      data: {
        sourceType: 'youtube',
        items: [
          {
            id: video.vid,
            title: video.title,
            url: video.url,
            thumb: video.thumb,
            bigthumb: video.bigthumb,
            playlist: playlist,
            quality: quality
          }
        ]
      }
    });
  });
};

LoginCtrl = function($scope) {
  $scope.username = '';
  $scope.password = '';
  $scope.remember = true;
  $scope.error = false;
  $scope.reqServer = false;
  return $scope.login = function() {
    var username;

    $scope.reqServer = true;
    username = $scope.username;
    return $.ajax("http://" + ADDRESS + PATH + API.LOGIN, {
      type: "POST",
      data: {
        _: Math.random(),
        user: username,
        pwd: $scope.password
      },
      dataType: "json",
      timeout: 4000
    }).always(function(res, status) {
      if (status === 'success' && String(res) === 'true') {
        $scope.updateUser(username, $scope.username === 'admin' ? true : false);
        $scope.error = false;
      } else {
        $scope.updateUser(null, false);
        $scope.error = true;
      }
      $scope.reqServer = false;
      return $scope.$apply();
    });
  };
};

SearchCtrl = function($scope) {
  var listenCount;

  $scope.items = [];
  $scope.keyword = '';
  $scope.playlist = '';
  $scope.page = {
    now: 1,
    total: 1,
    start: 0,
    count: 8
  };
  $scope.nextPageToken = null;
  $scope.reqServer = false;
  $scope.videoDefinition = 'any';
  (listenCount = function() {
    var count, height, reserve;

    height = $(document).height();
    reserve = $('#header').height() + $('#search form').height() + $('#search .page-tools').height();
    count = $scope.page.count;
    $scope.page.count = Math.floor((height - reserve) / 88) || 1;
    if ($scope.page.count !== count) {
      $scope.$apply();
    }
    return setTimeout(listenCount, 2000);
  })();
  $scope.$watch('page.now', function(newValue, oldValue) {
    if ($scope.reqServer === true || !$scope.nextPageToken) {
      return;
    }
    if ($scope.page.now > $scope.items.length / $scope.page.count - 3) {
      return $scope.request($scope.nextPageToken);
    }
  });
  $scope.gotoPage = function(page) {
    if (page < 1 || page > $scope.page.total) {
      return;
    }
    $scope.page.now = page;
    return $scope.page.start = ($scope.page.now - 1) * $scope.page.count;
  };
  $scope.pageDisable = function(value) {
    value += $scope.page.now;
    if (value < 1 || value > $scope.page.total) {
      return true;
    } else {
      return false;
    }
  };
  $scope.request = function(key) {
    var params;

    params = {
      key: 'AIzaSyCpOMFgf1ZKObU6zyAjckcLrMuD56ZVzfM',
      q: $scope.keyword,
      part: 'snippet',
      maxResults: 50,
      type: 'video,movie',
      order: 'viewCount',
      videoDefinition: $scope.videoDefinition
    };
    if (key) {
      params.pageToken = key;
    }
    $scope.reqServer = true;
    return $.ajax({
      type: 'GET',
      url: 'https://www.googleapis.com/youtube/v3/search',
      data: params,
      dataType: 'jsonp'
    }).always(function(res, status) {
      if (status !== 'success') {
        return;
      }
      $scope.page.total = Math.ceil(res.pageInfo.totalResults / $scope.page.count);
      $.each(res.items, function(i, item) {
        return $scope.items.push({
          vid: item.id.videoId,
          title: item.snippet.title,
          thumb: item.snippet.thumbnails["default"].url,
          bigthumb: item.snippet.thumbnails.high.url,
          availableQuality: null,
          description: item.snippet.description,
          quality: {
            Original: false,
            HD1080: false,
            HD720: false,
            Medium: false,
            Audio: true
          },
          download: false,
          url: 'http://www.youtube.com/watch?v=' + item.id.videoId
        });
      });
      $scope.nextPageToken = res.nextPageToken ? res.nextPageToken : null;
      $scope.reqServer = false;
      return $scope.$apply();
    });
  };
  $scope.search = function(definition) {
    $scope.videoDefinition = definition ? 'high' : 'any';
    $scope.items = [];
    $scope.page.now = 1;
    $scope.page.total = 1;
    $scope.page.start = 0;
    $scope.nextPageToken = null;
    $scope.page.count = Math.floor(($scope.height - 282) / 160);
    $scope.request();
    $scope.updatePlaylist($scope.keyword);
    $scope.playlist = $scope.keyword;
    return $('#search input').blur();
  };
  $scope.download = function(index) {
    var item;

    item = $scope.items[index + $scope.page.start];
    return $scope.$emit('download', item, $scope.playlist, ['Highest', 'Audio']);
  };
  return $scope.look = function(index) {
    var item;

    item = $scope.items[index + $scope.page.start];
    return $scope.play(item);
  };
};

/*
Player
*/


PlayerCtrl = function($scope, $timeout) {
  $scope.video = null;
  $scope.playlist = '';
  $scope.player = false;
  $scope.$watch('width', function() {
    return $('#ytplayer').css({
      width: $scope.width * 0.4,
      height: $scope.width * 0.4 / 16 * 9
    });
  });
  $scope.$on('updatePlaylist', function(e, playlist) {
    return $scope.playlist = playlist;
  });
  $scope.$on('play', function(e, video) {
    $scope.video = video;
    $scope.player = true;
    if (!$scope.video.availableQuality) {
      return $.ajax({
        type: 'GET',
        url: API.YT_QUALITY,
        data: {
          vid: video.vid
        },
        dataType: 'json'
      }).done(function(res) {
        var availableQuality, qualitys;

        if (res.status === 'success') {
          qualitys = res.data.split(',');
          availableQuality = {};
          angular.forEach(qualitys, function(quality, key) {
            quality = quality.split('\\\/');
            switch (parseInt(quality[0], 10)) {
              case 18:
                return availableQuality.Medium = true;
              case 22:
                return availableQuality.HD720 = true;
              case 37:
                return availableQuality.HD1080 = true;
              case 38:
                return availableQuality.Original = true;
            }
          });
          $scope.video.availableQuality = availableQuality;
          return $scope.$apply();
        }
      });
    }
  });
  return $scope.download = function(all) {
    var quality;

    quality = [];
    if ($scope.video.quality.Audio) {
      quality.push('Audio');
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
      if (quality.length < 1) {
        quality.push('All');
      }
    }
    return $scope.$emit('download', $scope.video, $scope.playlist, quality);
  };
};
