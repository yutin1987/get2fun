var ADDRESS, API, LoginCtrl, MainCtrl, PATH, PlayerCtrl, SearchCtrl, WATCH_TIME, hg2App;

ADDRESS = location.host;

PATH = '/hg2/';

API = {
  TASK: 'api/dls5.php',
  LOGIN: 'api2/login2.php',
  INFO: 'api2/info.php'
};

WATCH_TIME = 1000;

hg2App = angular.module('hg2', []);

hg2App.filter('startFrom', function() {
  return function(input, start) {
    return input.slice(start);
  };
});

MainCtrl = function($scope) {
  $scope.guest = false;
  $scope.admin = false;
  $scope.play = function(video) {
    return $scope.$broadcast('play', video);
  };
  return $scope.updatePlaylist = function(playlist) {
    return $scope.$broadcast('updatePlaylist', playlist);
  };
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
  $scope.page = 1;
  $scope.pageTotal = 1;
  $scope.pageStart = 0;
  $scope.pageCount = 8;
  $scope.nextPageToken = null;
  $scope.reqServer = false;
  $scope.$watch('page', function(newValue, oldValue) {
    if ($scope.reqServer === true || !$scope.nextPageToken) {
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
      q: $scope.keyword,
      part: 'snippet',
      maxResults: 50
    };
    if (page) {
      params.pageToken = page;
    }
    $scope.reqServer = true;
    return $.ajax({
      type: 'GET',
      url: 'https://www.googleapis.com/youtube/v3/search',
      data: params,
      dataType: "json"
    }).done(function(res, status) {
      if (status !== 'success') {
        return;
      }
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
      $scope.nextPageToken = res.nextPageToken ? res.nextPageToken : null;
      $scope.reqServer = false;
      return $scope.$apply();
    });
  };
  $scope.search = function() {
    $scope.items = [];
    $scope.page = 1;
    $scope.pageTotal = 1;
    $scope.pageStart = 0;
    $scope.nextPageToken = null;
    $scope.request();
    return $scope.updatePlaylist($scope.keyword);
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


PlayerCtrl = function($scope, $timeout) {
  $scope.video = {};
  $scope.playlist = '';
  $scope.player = false;
  $scope.$on('updatePlaylist', function(e, playlist) {
    return $scope.playlist = playlist;
  });
  $scope.$on('play', function(e, video) {
    $scope.video = video;
    return $scope.player = true;
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
};
