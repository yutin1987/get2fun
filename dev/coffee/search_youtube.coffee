ADDRESS = location.host

PATH = '/hg2/'

API =
  TASK: 'api/dls5.php'
  LOGIN: 'api2/login2.php'
  INFO: 'api2/info.php'

WATCH_TIME = 1000

hg2App = angular.module('hg2', []);

hg2App.filter 'startFrom', () ->
  (input, start) -> input.slice(start)

MainCtrl = ($scope) ->
  $scope.guest = no
  $scope.admin = no

  $scope.play = (video) ->
    $scope.$broadcast('play', video)

  $scope.updatePlaylist = (playlist) ->
    $scope.$broadcast('updatePlaylist', playlist)


LoginCtrl = ($scope) ->
  $scope.username = ''
  $scope.password = ''
  $scope.remember = on
  $scope.error = no
  $scope.reqServer = off

  $scope.rememberMe = () ->
    $scope.remember = if $scope.remember then off else on

  $scope.login = () ->
    $scope.reqServer = on
    $.ajax "http://" + ADDRESS + PATH + API.LOGIN,
      type: "POST"
      data:
        _ : Math.random()
        user: $scope.username
        pwd: $scope.password
      dataType: "json"
      timeout: 4000
    .done (res, status) ->
      if status is 'success' or String(res) not 'true'
        $scope.guest = yes
        $scope.admin = no
        $scope.error = yes
      else
        $scope.guest = no
        $scope.admin = yes if $scope.username is 'admin'
        $scope.error = no
      $scope.reqServer = off
      $scope.$apply()

SearchCtrl = ($scope) ->
  $scope.items = []

  $scope.keyword = ''
  $scope.page = 1
  $scope.pageTotal = 1
  $scope.pageStart = 0
  $scope.pageCount = 8
  $scope.nextPageToken = null
  $scope.reqServer = off

  $scope.$watch 'page', (newValue,oldValue) ->
    return if $scope.reqServer is on || !$scope.nextPageToken
    $scope.request($scope.nextPageToken) if $scope.page > $scope.items.length/$scope.pageCount - 3

  $scope.prevPage = () ->
    $scope.page -= 1 if $scope.page > 1
    $scope.pageStart = ($scope.page-1) * $scope.pageCount

  $scope.nextPage = () ->
    $scope.page += 1 if $scope.page < $scope.pageTotal
    $scope.pageStart = ($scope.page-1) * $scope.pageCount

  $scope.request = (page) ->
    params = 
      key: 'AIzaSyCpOMFgf1ZKObU6zyAjckcLrMuD56ZVzfM'
      q: $scope.keyword
      part: 'snippet'
      maxResults: 50

    params.pageToken = page if page
    $scope.reqServer = on
    $.ajax
      type: 'GET'
      url: 'https://www.googleapis.com/youtube/v3/search'
      data: params
      dataType: "json"
    .done (res, status) ->
      return if status isnt 'success'
      $scope.pageTotal = Math.ceil(res.pageInfo.totalResults / $scope.pageCount)
      $.each res.items, (i, item) ->
        $scope.items.push
          vid: item.id.videoId
          title: item.snippet.title
          thumb: item.snippet.thumbnails.default.url
          bigthumb: item.snippet.thumbnails.high.url
          availableQuality: null
          quality:
            Original: off
            HD1080: off
            HD720: off
            Medium: off
            Audio: on
          url: 'http://www.youtube.com/watch?v='+item.id.videoId
      $scope.nextPageToken = if res.nextPageToken then res.nextPageToken else null
      $scope.reqServer = off
      $scope.$apply()

  $scope.search = () ->
    $scope.items = []
    $scope.page = 1
    $scope.pageTotal = 1
    $scope.pageStart = 0
    $scope.nextPageToken = null
    $scope.request()
    $scope.updatePlaylist $scope.keyword

  $scope.look = (index) ->
    item = $scope.items[index+$scope.pageStart]
    $scope.play(item)

###
Player
###
PlayerCtrl = ($scope, $timeout) ->

  $scope.video = {}
  $scope.playlist = ''
  $scope.player = off


  $scope.$on 'updatePlaylist', (e, playlist) ->
    $scope.playlist = playlist

  $scope.$on 'play', (e, video)->

    #ytplayer.loadVideoById(video.vid, 0)

    $scope.video = video
    $scope.player = on


    # ( ->
    #   getAvailableQualityLevels = arguments.callee
    #   $timeout ( ->
    #     quality = ytplayer.getAvailableQualityLevels?()
    #     if quality?.length > 0
    #       ytplayer.stopVideo()
    #       $scope.video.availableQuality =
    #         HD1080: on if quality.indexOf('hd1080')
    #         HD720: on if quality.indexOf('hd720')
    #         Medium: on if quality.indexOf('medium')
    #         Original: on if quality.indexOf('highres')
    #     else
    #       getAvailableQualityLevels()
    #   ), 1000
    # )()

  $scope.download = (all) ->
    limit = 1
    quality = []
    if $scope.video.quality.Audio
      quality.push 'Audio'
      limit += 1

    if all
      quality.push 'All'
    else
      quality.push 'Original' if $scope.video.quality.Original
      quality.push '1080P' if $scope.video.quality.HD1080
      quality.push '720P' if $scope.video.quality.HD720
      quality.push '360P' if $scope.video.quality.Medium
      if quality.length < limit
        angular.forEach $scope.video.availableQuality, (value, key) ->
          quality.push key
          $scope.video.quality[key] = on
    
    $scope.close()

    $http
      method: 'POST'
      url: "/hg2/api2/add_task.php"
      data: $.param(
        sourceType: 'youtube'
        #sourceKind: null
        #cookie_string: document.cookie
        #cookie_domain: null
        items: [
          id: $scope.video.vid
          title: $scope.video.title
          url: $scope.video.url
          thumb: $scope.video.thumb
          bigthumb: $scope.video.bigthumb
          playlist: $scope.playlist
          quality: quality #'1080P','720P','360P','Original','Audio','Highest','All'
        ]
      )