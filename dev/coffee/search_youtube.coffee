ADDRESS = location.host

PATH = '/hg2/'

API =
  TASK: 'api/dls5.php'
  LOGIN: 'api2/login2.php'
  INFO: 'api2/info.php'
  YT_QUALITY: 'api4fe/ytquality.php'

WATCH_TIME = 1000

$(() ->
  userAgent = navigator.userAgent
  body = $('body')

  device = /Android|webOS|iPhone|iPad|iPod|BlackBerry|PlayBook|Windows|Macintosh/i.exec(userAgent)
  if device
    device = device[0].toLowerCase()
    switch device
      when 'iphone', 'ipad', 'ipod' then body.addClass 'device-ios'
      when 'Windows', 'macintosh' then body.addClass 'device-desktop'
      when 'macintosh' then device = 'mac'
    body.addClass 'device-'+device
)

hg2App = angular.module('hg2', []);

hg2App.filter 'startFrom', () ->
  (input, start) -> input.slice(start)

MainCtrl = ($scope,$timeout) ->
  $scope.admin = no
  $scope.user = null
  $scope.serverStatus = 'stopped'

  $scope.width = 0
  $scope.height= 0

  resize = () ->
    $scope.width = $(document).width()
    $scope.height = $(document).height()

  (() ->
    resize()
    $timeout arguments.callee, 3000
  )()

  (sys_user = () ->
    $.ajax "http://" + ADDRESS + PATH + API.LOGIN + "?check",
      type: "POST"
      dataType: "json"
      timeout: 14000
    .always (res, status) ->
      if status is 'success' and res.status is "true"
        $scope.user = res.user
      else
        $scope.user = null
      $scope.$apply()
      $timeout sys_user, 5000
  )()
  
  (sys_info = () ->
    $.ajax "http://" + ADDRESS + PATH + API.INFO,
      type: "POST"
      dataType: "json"
      data: {it: 'server'}
      timeout: 14000
    .always (res, status) ->
      if status is 'success' and res.server?.server_status isnt 0
        switch res.server.server_status
          when 1 then $scope.serverStatus = 'running'
          when 2 then $scope.serverStatus = 'paused'
      else
        $scope.serverStatus = 'stopped'
      $scope.$apply()
      $timeout sys_info, 10000
  )()

  $scope.play = (video) ->
    $scope.$broadcast('play', video)

  $scope.logout = () ->
    $scope.admin = no
    $scope.user = null
    data =
      _ : Math.random()
      user: 'logout'
      pwd: 'logout'
    $.ajax "http://" + ADDRESS + PATH + API.LOGIN + "?logout",
      type: "POST"
      data: data
      dataType: "json"
      timeout: 4000

  $scope.updatePlaylist = (playlist) ->
    $scope.$broadcast('updatePlaylist', playlist)

  $scope.updateUser = (user, admin) ->
    $scope.user = user
    $scope.admin = admin

  $scope.$on 'download', (e, video, playlist, quality) ->
    return if video.download
    video.download = yes
    $scope.$broadcast('downloaded', video)
    $.ajax
      type: 'POST'
      url: "/hg2/api2/add_task.php"
      data: 
        sourceType: 'youtube'
        #sourceKind: null
        #cookie_string: document.cookie
        #cookie_domain: null
        items: [
          id: video.vid
          title: video.title
          url: video.url
          thumb: video.thumb
          bigthumb: video.bigthumb
          playlist: playlist
          quality: quality #'1080P','720P','360P','Original','Audio','Highest','All'
        ]

LoginCtrl = ($scope) ->
  $scope.username = ''
  $scope.password = ''
  $scope.remember = on
  $scope.error = no
  $scope.reqServer = off

  $scope.login = () ->
    $scope.reqServer = on
    username = $scope.username
    $.ajax "http://" + ADDRESS + PATH + API.LOGIN,
      type: "POST"
      data:
        _ : Math.random()
        user: username
        pwd: $scope.password
      dataType: "json"
      timeout: 4000
    .always (res, status) ->
      if status is 'success' and String(res) is 'true'
        $scope.updateUser username, if $scope.username is 'admin' then yes else no
        $scope.error = no
      else
        $scope.updateUser null, no 
        $scope.error = yes
      $scope.reqServer = off
      $scope.$apply()

SearchCtrl = ($scope) ->
  $scope.items = []

  $scope.keyword = ''
  $scope.playlist = ''
  $scope.page =
    now: 1
    total: 1
    start: 0
    count: 8
  $scope.nextPageToken = null
  $scope.reqServer = off
  $scope.videoDefinition = 'any'

  $scope.$watch 'height', () ->
    height = $('#header').height()+$('#search form').height()+$('#search .page-tools').height()
    if /Windows|Macintosh/i.exec(navigator.userAgent)
      $scope.page.count = Math.floor(($scope.height - height) / 88)
    else
      $scope.page.count = Math.floor(($scope.height - height) / 176)

  $scope.$watch 'page.now', (newValue,oldValue) ->
    return if $scope.reqServer is on || !$scope.nextPageToken
    $scope.request($scope.nextPageToken) if $scope.page.now > $scope.items.length/$scope.page.count - 3


  $scope.gotoPage = (page) ->
    return if page < 1 or page > $scope.page.total
    $scope.page.now = page
    $scope.page.start = ($scope.page.now-1) * $scope.page.count

  $scope.pageDisable = (value) ->
    value += $scope.page.now
    if value < 1 or value > $scope.page.total then true else false

  $scope.request = (key) ->
    params = 
      key: 'AIzaSyCpOMFgf1ZKObU6zyAjckcLrMuD56ZVzfM'
      q: $scope.keyword
      part: 'snippet'
      maxResults: 50
      type: 'video,movie'
      order: 'viewCount'
      videoDefinition: $scope.videoDefinition

    params.pageToken = key if key
    $scope.reqServer = on
    $.ajax
      type: 'GET'
      url: 'https://www.googleapis.com/youtube/v3/search'
      data: params
      dataType: 'jsonp'
    .always (res, status) ->
      return if status isnt 'success'
      $scope.page.total = Math.ceil(res.pageInfo.totalResults / $scope.page.count)
      $.each res.items, (i, item) ->
        $scope.items.push
          vid: item.id.videoId
          title: item.snippet.title
          thumb: item.snippet.thumbnails.default.url
          bigthumb: item.snippet.thumbnails.high.url
          availableQuality: null
          description: item.snippet.description
          quality:
            Original: off
            HD1080: off
            HD720: off
            Medium: off
            Audio: on
          download: no
          url: 'http://www.youtube.com/watch?v='+item.id.videoId
      $scope.nextPageToken = if res.nextPageToken then res.nextPageToken else null
      $scope.reqServer = off
      $scope.$apply()

  $scope.search = (definition) ->
    $scope.videoDefinition = if definition then 'high' else 'any'
    $scope.items = []
    $scope.page.now = 1
    $scope.page.total = 1
    $scope.page.start = 0
    $scope.nextPageToken = null
    $scope.page.count = Math.floor(($scope.height - 282) / 160)
    $scope.request()
    $scope.updatePlaylist $scope.keyword
    $scope.playlist = $scope.keyword
    $('#search input').blur()

  $scope.download = (index) ->
    item = $scope.items[index+$scope.page.start]
    $scope.$emit 'download', item, $scope.playlist, ['all']
  
  # $scope.$on 'downloaded', (e, video) ->
    # $scope.$apply()

  $scope.look = (index) ->
    item = $scope.items[index+$scope.page.start]
    $scope.play(item)

###
Player
###
PlayerCtrl = ($scope, $timeout) ->

  $scope.video = null
  $scope.playlist = ''
  $scope.player = off

  $scope.$watch 'width', () ->
    $('#ytplayer').css
      width: $scope.width*0.4
      height: $scope.width*0.4/16*9

  $scope.$on 'updatePlaylist', (e, playlist) ->
    $scope.playlist = playlist

  $scope.$on 'play', (e, video)->

    #ytplayer.loadVideoById(video.vid, 0)

    $scope.video = video
    $scope.player = on
    
    unless $scope.video.availableQuality
      $.ajax
        type: 'GET'
        url: API.YT_QUALITY
        data: {vid: video.vid}
        dataType: 'json'
      .done (res) ->
        if res.status is 'success'
          qualitys = res.data.split ','
          availableQuality = {}
          angular.forEach qualitys, (quality, key) ->
            quality = quality.split '\\\/'
            switch parseInt(quality[0],10)
              when 18
                availableQuality.Medium = on
              when 22
                availableQuality.HD720 = on
              when 37
               availableQuality.HD1080 = on
              when 38
               availableQuality.Original = on
          $scope.video.availableQuality = availableQuality
          $scope.$apply()

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

    $scope.$emit 'download', $scope.video, $scope.playlist, quality

  # $scope.$on 'downloaded', (e, video) ->
    # $scope.$apply()
