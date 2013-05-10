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
      $.cookie 'temp', 'temp-green', { expiress: 365}
    else
      $.removeCookie 'temp'

  $('body').addClass('temp-green') if $.cookie('temp') is 'temp-green'

  # Clean
  $(".box-nav .nav-clear").click ->
    req_server "clear_tasks",
      time: sys.time

    $($.task).each ->
      return unless this
      switch @status
        when STATUS.RELOAD, STATUS.CANCEL, STATUS.COMPLETE
          @del() if sys.user is "admin" or @owner is sys.user

  # Refresh
  $(".box-nav .nav-refresh").click ->
    $.task.reset()
    sys.time = 0
    load()

  # System Check
  $('#dialog-chrome a').click () ->
    $('body').removeClass 'no-chrome'
    $.cookie('donot-chrome', '1', { expiress: 365}) if $('#dialog-chrome .donot').is(':checked')
    return on
  $('body').addClass('no-chrome') unless $.browser.chrome is true or $.cookie('donot-chrome')?

  $('#dialog-ext a').click () ->
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
      timeout: 4000
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
      timeout: 4000
      success: (res) ->
        if res.status is "true"
          sys.user = res.user
        else
          $('body').addClass('guest')
        setTimeout(sys_user, 10000) if listen isnt off
      error: (xhr, ajaxOptions, thrownError) ->
        setTimeout(sys_user, 10000) if listen isnt off

  sys_user()

  # Logout
  $(".box-nav .nav-logout").click ->
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