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
  var body, device, userAgent;

  userAgent = navigator.userAgent;
  body = $('body');
  device = /Android|webOS|iPhone|iPad|iPod|BlackBerry|PlayBook|Windows|Macintosh/i.exec(userAgent);
  if (device) {
    device = device[0].toLowerCase();
    switch (device) {
      case 'iphone':
      case 'ipad':
      case 'ipod':
        body.addClass('device-ios');
        break;
      case 'macintosh':
        device = 'mac';
    }
    return body.addClass('device-' + device);
  }
});

hg2App = angular.module('hg2', []);

hg2App.filter('startFrom', function() {
  return function(input, start) {
    return input.slice(start);
  };
});

MainCtrl = function($scope, $timeout) {
  var resize;

  $scope.guest = false;
  $scope.admin = false;
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
  $scope.play = function(video) {
    return $scope.$broadcast('play', video);
  };
  $scope.updatePlaylist = function(playlist) {
    return $scope.$broadcast('updatePlaylist', playlist);
  };
  return $scope.$on('download', function(e, video, playlist, quality) {
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
  $scope.rememberMe = function() {
    return $scope.remember = $scope.remember ? false : true;
  };
  return $scope.login = function() {
    $scope.reqServer = true;
    return $.ajax("http://" + ADDRESS + PATH + API.LOGIN, {
      type: "POST",
      data: {
        _: Math.random(),
        user: $scope.username,
        pwd: $scope.password
      },
      dataType: "json",
      timeout: 4000
    }).done(function(res, status) {
      if (status === 'success' || String(res)(!'true')) {
        $scope.guest = true;
        $scope.admin = false;
        $scope.error = true;
      } else {
        $scope.guest = false;
        if ($scope.username === 'admin') {
          $scope.admin = true;
        }
        $scope.error = false;
      }
      $scope.reqServer = false;
      return $scope.$apply();
    });
  };
};

SearchCtrl = function($scope) {
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
  $scope.$watch('height', function() {
    return $scope.page.count = Math.floor(($scope.height - 282) / 160);
  });
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
      maxResults: 50
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
    }).done(function(res, status) {
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
  $scope.search = function() {
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
    return $scope.$emit('download', item, $scope.playlist, ['all']);
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
    return $scope.$emit('download', $scope.video, $scope.playlist, quality);
  };
};
