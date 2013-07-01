#https://www.googleapis.com/youtube/v3/search?q=football&part=snippet&key=
#https://www.googleapis.com/youtube/v3/search?key=AIzaSyCpOMFgf1ZKObU6zyAjckcLrMuD56ZVzfM&q=test&part=snippet
###
Variable Initialization
###
sys =
  time: 0,
  watch: null
  user: null

###
request to server
v: get_task, get_tasks, cancel_task, redownload_task, clear_tasks, pause_server
###
req_server = (v, data = {}, success, failed) ->
  data._ = Math.random()

  $.ajax "http://" + ADDRESS + PATH + API.TASK + "?v=" + v,
    type: "POST"
    data: data
    dataType: "json"
    timeout: 2000
    success: (res) ->
      if res.code < 0
        failed? res
      else
        success? res.value

    error: (xhr, ajaxOptions, thrownError) ->
      failed? {code: -400}
###
Watch Action
###
watch_action = ->
  req_server "get_tasks",
    time: sys.time
  , (data) ->
    $("#control").addClass "online"
    $('body').removeClass 'guest'
    $(data).each ->
      tid = parseInt(@tid)
      target = $.task[tid]
      unless target?
        $.task.push
          tid: @tid
          src_type: @srcType
          added_time: @added_time
          owner: @owner
          name: @name
          playlist: @playlist
          quality: @quality
          src: @srcUrl
          thumb: @cover
          time: @time
          status: 4
          size: @size
          dl_size: @dlSize
          sub_task: @subTaskTotal
          sub_task_ok: @subTaskOk
      else if @time >= target.time
        target.thumb = @cover
        target.time = @time
        target.status = @status
        target.quality = @quality
        target.size = @size
        target.dl_size = @dlSize
        target.sub_task = @subTaskTotal
        target.sub_task_ok = @subTaskOk
        sys.time = @time if @time > sys.time

    sys.watch = setTimeout watch_action, WATCH_TIME
  , (res) ->
    $("#control").removeClass "online"
    $('body').addClass('guest') if res.code is -2
    sys.watch = setTimeout watch_action, WATCH_TIME * 5

###
Main
###
$ ->

  ###
  Initialization button
  ###

  # Logo
  $('#logo').click ->
    $('body').toggleClass('temp-green')
    if $('body').hasClass('temp-green')
      _gaq.push ['_trackEvent', 'Configs', 'setColor', 'Green']
      $.cookie 'temp', 'temp-green', { expiress: 365}
    else
      _gaq.push ['_trackEvent', 'Configs', 'setColor', 'Blue']
      $.removeCookie 'temp'

  $('body').addClass('temp-green') if $.cookie('temp') is 'temp-green'


  # Refresh
  $(".box-nav .nav-refresh").click ->
    _gaq.push ['_trackEvent', 'Operate', 'Refresh', $.task.length]
    $.task.reset()
    sys.time = 0
    load()
    
  # Clean
  $(".box-nav .nav-clear").click ->
    _gaq.push ['_trackEvent', 'Operate', 'Clean', $.task.length]
    req_server "clear_tasks",
      time: sys.time

    $($.task).each ->
      return unless this
      switch @status
        when STATUS.RELOAD, STATUS.CANCEL, STATUS.COMPLETE
          @del() if sys.user is "admin" or @owner is sys.user
    
  # Program
  $(".box-nav .nav-program").click ->
    _gaq.push ['_trackEvent', 'Operate', 'Program', '']
    
  # Page
  $(".box-nav .nav-fb").click ->
    _gaq.push ['_trackEvent', 'Operate', 'Facebook', '']
    
  # Extension
  $(".box-nav .nav-ext").click ->
    _gaq.push ['_trackEvent', 'Operate', 'Extension', '']

  # Logout
  $(".box-nav .nav-logout").click ->
    _gaq.push ['_trackEvent', 'Operate', 'logout', sys.user]
    data =
      _ : Math.random()
      user: 'logout'
      pwd: 'logout'

    sys.user = null
    
    $('.login').removeClass 'invalid'
          
    $.ajax "http://" + ADDRESS + PATH + API.LOGIN + "?logout",
      type: "POST"
      data: data
      dataType: "json"
      timeout: 4000

  # System Check
  $('#dialog-chrome a').click () ->
    _gaq.push ['_trackEvent', 'Check', 'Is not chrome', $('#dialog-chrome .donot').is(':checked')]
    $('body').removeClass 'no-chrome'
    $.cookie('donot-chrome', '1', { expiress: 365}) if $('#dialog-chrome .donot').is(':checked')
    return on
  $('body').addClass('no-chrome') unless $.browser.chrome is true or $.cookie('donot-chrome')?

  $('#dialog-ext a').click () ->
    _gaq.push ['_trackEvent', 'Check', 'Not has ext', $('#dialog-ext .donot').is(':checked')]
    $('body').addClass 'has-ext'
    $.cookie('donot-ext', '1', { expiress: 365}) if $('#dialog-ext .donot').is(':checked')
    return on
  $('body').addClass('has-ext') if $.browser.chrome isnt true or $.cookie('donot-ext')?


  $('#dialog-qpkg a, #dialog-error a').click () ->
    $('body').removeClass 'has-error no-qpkg'
    return on

  sys_status = (listen) ->
    $.ajax "http://" + ADDRESS + PATH + API.INFO,
      type: "POST"
      dataType: "json"
      data: {it: 'server'}
      timeout: 14000
      success: (res) ->
        if res.server?
          if res.server.qpkg_status isnt 'TRUE'
            $('body').addClass 'no-qpkg'
          else if res.server.process_status isnt 1 || res.server.server_status is 0
            $('body').addClass 'has-error'
          else
            $('body').removeClass 'no-qpkg has-error'

          switch res.server.server_status
            when 0
              $('#control').attr 'class', 'server-stopped'
            when 1
              $('#control').attr 'class', 'server-running'
            when 2
              $('#control').attr 'class', 'server-paused'
        else
          $('body').addClass 'has-error'
        setTimeout(sys_status, 10000) if listen isnt off
      error: (xhr, ajaxOptions, thrownError) ->
        setTimeout(sys_status, 10000) if listen isnt off

  sys_status()

  sys_user = (listen) ->
    $.ajax "http://" + ADDRESS + PATH + API.LOGIN + "?check",
      type: "POST"
      dataType: "json"
      timeout: 14000
      success: (res) ->
        if res.status is "true"
          sys.user = res.user
        else
          $('body').addClass('guest')
        setTimeout(sys_user, 10000) if listen isnt off
      error: (xhr, ajaxOptions, thrownError) ->
        setTimeout(sys_user, 10000) if listen isnt off

  sys_user()

  # Group Cancel
  $.task.setListen TASK.GROUP_CANCEL, (tid) ->
    if tid.length > 0
      req_server "cancel_task",
        tid: tid

  # Group Reload
  $.task.setListen TASK.GROUP_RELOAD, (tid) ->
    if tid.length > 0
      req_server "redownload_task",
        tid: tid

  # Task Cancel
  $.task.setListen TASK.TASK_CANCEL, (tid) ->
    if tid?
      req_server "cancel_task",
        tid: [tid]

  # Task Reload
  $.task.setListen TASK.TASK_RELOAD, (tid) ->
    if tid?
      req_server "redownload_task",
        tid: [tid]

  #login
  login_action = ->
    user = $('#username').val()
    pwd = $('#password').val()

    data =
      _ : Math.random()
      user: user
      pwd: pwd

    $('.login').removeClass 'invalid'
    $('.login').addClass 'proceed'
    $.ajax "http://" + ADDRESS + PATH + API.LOGIN,
      type: "POST"
      data: data
      dataType: "json"
      timeout: 4000
      success: (res) ->
        if String(res) is 'true'
          $('body').removeClass 'guest'
        else
          $('.login').addClass 'invalid'
          $('body').addClass 'guest'

        sys.user = user
        
        $('.login').removeClass 'proceed'

      error: (xhr, ajaxOptions, thrownError) ->
        $('.login').removeClass 'proceed'
        $('body').addClass 'guest'


  $('.login').keypress (e) ->
    key = e.keyCode || e.which
    login_action() if key == 13

  $('#login-submit').click login_action

  $('.login .remember').click ->
    $(@).toggleClass('checked')

  # Control
  $("#control").click ->
    sys_status off

    return off if $(@).hasClass('server-stopped')

    req_server 'pause_server'
    $(this).toggleClass "server-paused"

  ###
  System load
  ###
  load = ->
    if sys.watch?
      clearTimeout sys.watch
      delete sys.watch
    sys.watch = setTimeout watch_action, WATCH_TIME

  load()

###
YouTube Search
###
hg2App = angular.module('hg2', []);

hg2App.filter 'startFrom', () ->
  (input, start) -> input.slice(start)

RootCtrl = ($scope) ->
  $scope.search = off
  $scope.searchActive = 'inactive'

  $scope.play = (video) ->
    $scope.$broadcast('play', video)

  $scope.updatePlaylist = (playlist) ->
    $scope.$broadcast('updatePlaylist', playlist)

  $scope.$on 'search', (e, enable) ->
    $scope.searchActive = if enable then 'active' else 'inactive'
    $scope.$apply()

SearchCtrl = ($scope, $rootScope, $http) ->
  delete $http.defaults.headers.common['X-Requested-With']
  $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded"

  $scope.items = []
  $scope.qVal = ''
  $scope.page = 1
  $scope.pageTotal = 1
  $scope.pageStart = 0
  $scope.pageCount = 8
  $scope.nextPageToken = null

  $scope.$watch 'page', (newValue,oldValue) ->
    return unless $scope.nextPageToken

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
      q: $scope.qVal
      part: 'snippet'
      maxResults: 50
    params.pageToken = page if page

    $http
      method: 'GET'
      url: 'https://www.googleapis.com/youtube/v3/search'
      params: params
    .success (res, status, headers, config) ->
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

  $scope.search = () ->
    $scope.updatePlaylist $scope.qVal
    $scope.items = []
    $scope.page = 1
    $scope.pageTotal = 1
    $scope.pageStart = 0
    $scope.nextPageToken = null
    $scope.request()
    $scope.$emit('search', on)

  $scope.cancel = () ->
    $scope.$emit('search', off)
    $scope.items = []
    $scope.qVal = ''
    $scope.page = 1
    $scope.pageTotal = 1
    $scope.pageStart = 0
    $scope.nextPageToken = null

  $scope.look = (index) ->
    item = $scope.items[index+$scope.pageStart]
    $scope.play(item)

PlayerCtrl = ($scope, $timeout, $http) ->
  $scope.video = {}
  $scope.playlist = ''
  $scope.player = off

  $scope.$on 'updatePlaylist', (e, playlist) ->
    $scope.playlist = playlist

  $scope.$on 'play', (e, video)->
    $scope.video = video
    $scope.player = on

    swfobject.embedSWF 'http://www.youtube.com/v/'+video.vid+'?enablejsapi=1&playerapiid=ytplayer&version=3&autoplay=1',
                       "ytplayer", "640", "360", "8", null, null, { allowScriptAccess: "always" }
    ( ->
      getAvailableQualityLevels = arguments.callee
      $timeout ( ->
        quality = ytplayer.getAvailableQualityLevels?()
        if quality?.length > 0
          $scope.video.availableQuality =
            HD1080: on if quality.indexOf('hd1080')
            HD720: on if quality.indexOf('hd720')
            Medium: on if quality.indexOf('medium')
            Original: on if quality.indexOf('highres')
        else
          getAvailableQualityLevels()
      ), 1000
    )() unless video.availableQuality

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

  $scope.close = () ->
    $scope.player = off
    ytplayer.stopVideo()
