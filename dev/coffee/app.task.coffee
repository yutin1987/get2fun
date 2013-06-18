TASK =
  TASK_CANCEL: 0
  TASK_RELOAD: 1
  GROUP_CANCEL: 2
  GROUP_RELOAD: 3

$.task = ( ->
  
  ###
  Task Static Variable
  ###
  doc = 
    group:
      sample: null
      download: null
      list: null
      cursor: null
      filter: null
    task:
      sample: null
      download: null
      list: null
      cursor: null
      filter: null
  listen = []

  ###
  GroupData Object
  ###
  class GroupData extends Array

    constructor: (data) ->
      # return original when this object create
      return $(data).data("GroupData") if (data instanceof jQuery) and $(data).data("GroupData")

      # Public Variable
      data.tag = null
      @dltag = null
      @sum = [0, 0, 0, 0, 0, 0]
      Object.defineProperty @, 'name',
        get: ->
          data.name
      Object.defineProperty @, 'tag',
        get: ->
          unless data.tag?
            data.tag = doc.group.sample.clone()
            data.tag.data("GroupData", @).attr "key", data.name
            $(".name", data.tag).text data.name
            for val in ['thumb', 'owner', 'src_type', 'status']
              temp = @[val]
              delete data[val]
              @[val] = temp
          data.tag
      Object.defineProperty @, 'thumb',
        get: ->
          data.thumb || ''
        set: (val) ->
          data.thumb = val
          $(".thumb .img", @tag).empty().append $('<img onerror="this.src=\'data:image/gif;base64,R0lGODlhAwADAIAAAAAAAP///yH5BAEHAAEALAAAAAADAAMAAAIDjH8FADs=\'" />').attr 'src', val
          $(".thumb .img", @dltag).empty().append $('<img onerror="this.src=\'data:image/gif;base64,R0lGODlhAwADAIAAAAAAAP///yH5BAEHAAEALAAAAAADAAMAAAIDjH8FADs=\'" />').attr 'src', val if @dltag?
      Object.defineProperty @, 'owner',
        get: ->
          data.owner || ''
        set: (val) ->
          return unless val?
          val = val.toLowerCase()

          return if @owner? and @owner.toLowerCase() is val

          temp = @owner


          if @owner
            data.owner = 'multiple'
          else
            data.owner = val

          @tag.removeClass 'owner-'+temp
          @tag.addClass 'owner-'+@owner
          if @dltag?
            @dltag.removeClass 'owner-'+temp
            @dltag.addClass 'owner-'+@owner

          group.owner = @owner
      Object.defineProperty @, 'src_type',
        get: ->
          data.src_type
        set: (val) ->
          return unless val?
          val = val.toLowerCase()
          
          return if @src_type? and @src_type.toLowerCase() is val

          temp = @src_type

          if @src_type
            data.src_type = 'multiple'
          else
            data.src_type = val

          @tag.removeClass 'src-'+temp
          @tag.addClass 'src-'+@src_type
          if @dltag?
            @dltag.removeClass 'src-'+temp
            @dltag.addClass 'src-'+@src_type

          group.src = @src_type
      Object.defineProperty @, 'status',
        get: ->
          data.status
        set: (val) ->
          @tag.removeClass 'status-'+STATUS_NAME[data.status]
          @tag.addClass 'status-'+STATUS_NAME[val]
          if @dltag?
            @dltag.removeClass 'status-'+STATUS_NAME[data.status]
            @dltag.addClass 'status-'+STATUS_NAME[val]
          data.status = val
          $(".total", @tag).text @sum[STATUS.COMPLETE] + " / " + @length
          $(".total", @dltag).text @sum[STATUS.COMPLETE] + " / " + @length if @dltag?

    # Public Function
    push: (task) ->
      Array::push.call @, task
      @toggle false, task.status
      @thumb = task.thumb if task.thumb?
      @owner = task.owner
      @src_type = task.src_type
      this

    del: (task_data) ->
      index = $.inArray task_data, @
      if index > -1
        @splice index, 1
        @toggle task_data.status, false
        unless @length > 0
          group.del @
          $(@tag).fadeOut 500, -> $(@).remove()
          if @dltag?
            $(@dltag).fadeOut 500, -> $(@).remove()
      this

    toggle: (from, to) ->
      @sum[from]-- if from? and from isnt false
      @sum[to]++ if to? and to isnt false

      if @sum[STATUS.WAIT] + @sum[STATUS.DOWNLOAD] < 1
        if @sum[STATUS.FAIL] > 0
          @status = STATUS.FAIL
        else if @sum[STATUS.COMPLETE] > 0
          @status = STATUS.COMPLETE
        else
          @status = STATUS.CANCEL
      else
        if @sum[STATUS.DOWNLOAD] > 0
          @status = STATUS.DOWNLOAD
        else
          @status = STATUS.WAIT

  ###
  Group Object
  ###
  $.group = group = new class extends Array
    obj =
      index: 0
      data: {}
      filter:
        owner: null
        owner_list: []
        src: null
        src_list: []
    
    constructor: ->
      Object.defineProperty @, 'owner',
        get: ->
          obj.filter.owner
        set: (val) ->
          return unless val?
          val = val.toLowerCase()

          return unless obj.filter.owner_list.indexOf(val) < 0
          obj.filter.owner_list.push val

          $("#filter-owner select", doc.group.filter).append $("<option />").text val
          $('#filter').html($('#filter').html()+' #group .filter-owner-'+val+' .item:not(.owner-'+val+'){ height: 0px;border: none;}')
      Object.defineProperty @, 'src',
        get: ->
          obj.filter.src
        set: (val) ->
          return unless val?
          val = val.toLowerCase()

          return unless obj.filter.src_list.indexOf(val) < 0
          obj.filter.src_list.push val

          $("#filter-src select", doc.group.filter).append $("<option />").text val
          $('#filter').html($('#filter').html()+' #group .filter-src-'+val+' .item:not(.src-'+val+'){ height: 0px;border: none;}')

    # Public Static Function
    # Data
    push: (item) ->
      # GroupData 
      item = new GroupData(item)
      # push
      obj.data[item.name] = item
      Array::push.call @, item

      task.toggleGroup(item) if @length is 1

      item

    # Data
    get: (name) ->
      obj.data[name]

    del: (group_data) ->
      delete obj.data[group_data.name]
      index = $.inArray group_data, @
      if index > -1
        @splice index, 1
      this
    
    # Data
    reset: ->
      # clear group data
      obj.index = 0
      obj.data = {}
      @pop() while @length > 0

      # clear filter
      obj.filter = 
        owner: null
        owner_list: []
        src: null
        src_list: []
      
      # reset private static variable
      $(".item", doc.group.list).remove()
      $(".item", doc.group.download).remove()

      $("#filter-owner option", doc.group.filter).slice(1).remove()
      $("#filter-src option", doc.group.filter).slice(1).remove()
      $('#filter').empty()

      @owner = 'multiple'
      @src = 'multiple'

      this
    
    # Display
    draw: ->
      return obj.index = @length if obj.index >= @length

      top = doc.group.cursor.offset().top - $(window).scrollTop()
      if top < ($(window).height() * 1.5)
        draw = []
        loop
          draw.push @[obj.index].tag
          obj.index++
          break unless obj.index % 5 > 0 and obj.index < @length
      doc.group.cursor.before draw
      this
  
  ###
  TaskData Object
  ###
  class TaskData
    dltag: null

    constructor: (data) ->
      
      # return original when this object create
      return $(data).data("TaskData") if (data instanceof jQuery) and $(data).data("TaskData")
      
      data.tid = parseInt data.tid
      data.status = parseInt data.status

      # Public Attr
      Object.defineProperty @, "tid",
        value: data.tid
        writeable: false
      Object.defineProperty @, "playlist",
        value: data.playlist
        writeable: false
      Object.defineProperty @, "name",
        value: data.name
        writeable: false
      Object.defineProperty @, "owner",
        value: data.owner
        writeable: false
      Object.defineProperty @, "src_type",
        value: data.src_type
        writeable: false
      Object.defineProperty @, "src",
        value: data.src
        writeable: false
      Object.defineProperty this, "time",
        get: ->
          data.time
        set: (val) ->
          data.time = parseInt(val)

      Object.defineProperty @, "tag",
        get: ->
          unless data.tag?
            data.tag = doc.task.sample.clone()
            @tag.data("TaskData", @).attr "tid", @tid
            @tag.addClass 'src-'+data.src_type.toLowerCase()
            $(".thumb", @tag).attr('href', @src || '#')
            $(".name", @tag).text @name
            $(".owner", @tag).text @owner
            @tag.addClass 'status-'+STATUS_NAME[@status]
            for val in ['added_time', 'thumb', 'quality', 'size', 'dl_size', 'sub_task', 'sub_task_ok']
              temp = @[val]
              data[val] = null
              @[val] = temp
          data.tag
      Object.defineProperty this, "status",
        get: ->
          data.status
        set: (val) ->
          temp = @status

          data.status = parseInt val

          if @status isnt temp
            belong = group.get(@playlist)
            belong.toggle temp, @status

          if @status is STATUS.DOWNLOAD
            task.download = this
          else if task.download is this
            task.download = off

          @tag.removeClass 'status-'+STATUS_NAME[temp]
          @tag.addClass 'status-'+STATUS_NAME[@status]
          
          if @dltag?
            @dltag.removeClass 'status-'+STATUS_NAME[temp]
            @dltag.addClass 'status-'+STATUS_NAME[@status]
      Object.defineProperty @, "quality",
        get: ->
          data.quality
        set: (val) ->
          quality = ''
          if val?
            for item in val
              continue unless item?
              item = item.toLowerCase()
              if quality isnt '' and quality isnt item
                 quality = 'multi'
                 break;
              quality = item
          $(".quality", @tag).attr 'class', 'quality quality-'+quality
          data.quality = val
      Object.defineProperty this, "added_time",
        get: ->
          data.added_time
        set: (val) ->
          $(".time", @tag).text new Date(val * 1000).toFormat("yyyy-MM-dd")
          $(".time", @dltag).text new Date(val * 1000).toFormat("yyyy-MM-dd") if @dltag?
          data.added_time = val
      Object.defineProperty this, "thumb",
        get: ->
          data.thumb
        set: (val) ->
          return if val is @thumb

          group.get(@playlist)?.thumb = val

          $('.thumb .img', @tag).empty().append $('<img onerror="this.src=\'data:image/gif;base64,R0lGODlhAwADAIAAAAAAAP///yH5BAEHAAEALAAAAAADAAMAAAIDjH8FADs=\'" />').attr 'src', val
          $('.thumb .img', @dltag).empty().append $('<img onerror="this.src=\'data:image/gif;base64,R0lGODlhAwADAIAAAAAAAP///yH5BAEHAAEALAAAAAADAAMAAAIDjH8FADs=\'" />').attr 'src', val if @dltag?
          data.thumb = val
      Object.defineProperty this, "size",
        get: ->
          data.size
        set: (val) ->
          data.size = parseInt(val) || 0

          if @size < 1
            $(".est-size, dl-size", @tag).empty()
            $(".est-size, dl-size", @dltag).empty() if @dltag
          else
            $(".est-size", @tag).html '&nbsp;/&nbsp;'+$.filesize(@size)
            $(".est-size", @dltag).html '&nbsp;/&nbsp;'+$.filesize(@size) if @dltag
      Object.defineProperty this, "dl_size",
        get: ->
          data.dl_size
        set: (val) ->
          data.dl_size = parseInt(val) || 0

          $(".dl-size", @tag).text $.filesize(@dl_size)
          $(".dl-size", @dltag).text $.filesize(@dl_size) if @dltag
          
          $(".bar", @tag).width (@dl_size / @size * 100) + "%"
          $(".bar", @dltag).width (@dl_size / @size * 100) + "%" if @dltag
      Object.defineProperty this, "sub_task",
        get: ->
          data.sub_task || 0
        set: (val) ->
          data.sub_task = parseInt(val) || 0

          if @sub_task > 0
            $(@tag).addClass 'has-sub'

            $(".total-sub", @tag).html '&nbsp;/&nbsp;'+@sub_task
            $(".total-sub", @dltag).html '&nbsp;/&nbsp;'+@sub_task if @dltag

            $(".bar", @tag).width (@sub_task_ok / @sub_task * 100) + "%"
            $(".bar", @dltag).width (@sub_task_ok / @sub_task * 100) + "%" if @dltag
      Object.defineProperty this, "sub_task_ok",
        get: ->
          data.sub_task_ok || 0
        set: (val) ->
          data.sub_task_ok = parseInt(val) || 0

          $(".ok-sub", @tag).text @sub_task_ok
          $(".ok-sub", @dltag).text @sub_task_ok if @dltag
  
          if @sub_task > 0
            $(".bar", @tag).width (@sub_task_ok / @sub_task * 100) + "%"
            $(".bar", @dltag).width (@sub_task_ok / @sub_task * 100) + "%" if @dltag
      
      # init
      this

    # Data
    del: ->
      $(@tag).fadeOut 500, ->
        $(this).remove()

      if @dltag
        $(@dltag).fadeOut 500, ->
          $(this).remove()

      delete task[@tid]
      group.get(@playlist).del @
  
  ###
  Task Object
  ###
  task = []
  
  task_obj =
    index: 0
    download: no
    group: null
    auto_review: null

  Object.defineProperty task, 'download',
    get: ->
      task_obj.download
    set: (task_data) ->
      temp = @download
      return if temp is task_data

      if temp isnt off
        if temp.status is STATUS.DOWNLOAD
          temp.time = new Date().getTime() / 1000
          temp.status = STATUS.COMPLETE
        if temp.dltag?
          temp.dltag.remove()
          temp.dltag = null
        belong = group.get(temp.playlist)
        if belong.dltag?
          belong.dltag.remove()
          belong.dltag = null

      if task_data
        unless task_data.dltag
          task_data.dltag = task_data.tag.clone()
        unless $('.item', doc.task.download).is task_data.dltag
          doc.task.download.append task_data.dltag
        
        belong = group.get(task_data.playlist)
        unless belong.dltag?
          belong.dltag = belong.tag.clone()
        unless $('.item', doc.group.download).is belong.dltag
          doc.group.download.append belong.dltag

      task_obj.download = task_data

  # Data
  task.push = (data) ->
    $(data).each ->
      # Task
      item = new TaskData @
      task[item.tid] = item
      
      # Group
      belong = group.get(item.playlist)

      belong = group.push(
        name: item.playlist
        owner: item.owner
        thumb: item.thumb
        src: item.src_type
      ) unless belong

      belong.push item
  task.reset = ->
    @pop() while @length > 0
    download = no
    group.reset()
    @toggleGroup()

    $(".item", doc.task.download).remove()
    this
  # Display
  task.toggleGroup = (playlist) ->
    target = null
    task_obj.group = if playlist? then playlist else null
    
    # clear interval review
    if task_obj.auto_review?
      clearInterval task_obj.auto_review
      delete task_obj.auto_review

    # reset private static variable
    $(".item", doc.task.list).remove()
    task_obj.index = 0

    # start auto review
    task_obj.auto_review = setInterval () ->
      group.draw()
      task.draw()
    , 300
  task.draw = () ->
    return this unless task_obj.group? && task_obj.index < task_obj.group.length

    top = doc.task.cursor.offset().top - $(window).scrollTop()
    if top < ($(window).height() * 1.5)
      draw = []
      loop
        draw.push task_obj.group[task_obj.index].tag
        task_obj.index++
        break unless task_obj.index % 5 > 0 and task_obj.index < task_obj.group.length
      doc.task.cursor.before draw
  task.setListen = (event_code, action) ->
    listen[event_code] = action


  # init
  $ ->

    # Group html
    group_wrap = $ '#group'
    doc.group =
      download: $ '.wrapper-download .download', group_wrap
      list: $ '.wrapper-list', group_wrap
      sample: $('.item', group_wrap).detach()
      cursor: $ '.wrapper-list .none', group_wrap
      filter: $ '.wrapper-filter .filter', group_wrap

    # Task html
    task_wrap = $ '.task'
    doc.task =
      download: $ '.wrapper-download .download', task_wrap
      list: $ '.wrapper-list', task_wrap
      sample: $('.item', task_wrap).detach()
      cursor: $ '.wrapper-list .none', task_wrap
      filter: $ '.wrapper-filter .filter', task_wrap
    
    task.reset()
    
    ###
    Event
    ###
    
    $(".item", group_wrap).live 'click', ->
      temp = group.get $(this).attr("key")
      _gaq.push ['_trackEvent', 'Group', 'See', temp.name]
      task.toggleGroup temp

    # Group Cancel
    $(".cancel", group_wrap).live 'click', ->
      wrap = $(this).parents(".item:first")
      group_data = new GroupData(wrap)
      _gaq.push ['_trackEvent', 'Group', 'Cancel', group_data.name]
      target = []
      $(group_data).each ->
        switch @status
          when STATUS.CANCEL, STATUS.COMPLETE
          else
            @status = STATUS.CANCEL
            @time = new Date().getTime() / 1000

            target.push @tid

      listen[TASK.GROUP_CANCEL]? target
    
    # Group Reload
    $(".reload", group_wrap).live 'click', ->
      wrap = $(this).parents(".item:first")
      group_data = new GroupData wrap
      _gaq.push ['_trackEvent', 'Group', 'Reload', group_data.name]
      target = []
      $(group_data).each ->
        switch @status
          when STATUS.RELOAD, STATUS.WAIT
          else
            @dl_size = 0
            @sub_task_ok = 0
            @status = STATUS.RELOAD
            @time = new Date().getTime() / 1000
            target.push @tid

      listen[TASK.GROUP_RELOAD]? target

    # Group Filter
    $("select", doc.group.filter).on("change", ->
      id = $(this).parent().attr("id")
      reg = new RegExp '^'+id+'-.+'
      selected = $("option:selected", this)
      val = selected.val();
      target = []

      _gaq.push ['_trackEvent', 'Group', id, val]

      # Setting display text
      $(this).prev().text selected.text()

      for item in $(doc.group.list).attr('class').split ' '
        target.push item if reg.exec item
      $(doc.group.list).removeClass target.join ' ' if target.length > 0
      $(doc.group.list).addClass id+'-'+val unless selected.is ":first-child"
    ).change()

    # Task Cancel
    $(".cancel", task_wrap).live 'click', ->
      wrap = $(this).parents(".item:first")
      tid = wrap.attr("tid")
      _gaq.push ['_trackEvent', 'Task', 'Cancel', task[tid].name]
      if task[tid]
        task[tid].status = STATUS.CANCEL
        task[tid].time = new Date().getTime() / 1000
      listen[TASK.TASK_CANCEL]? tid
    
    # Task Reload
    $(".reload", task_wrap).live 'click', ->
      wrap = $(this).parents(".item:first")
      tid = wrap.attr("tid")
      _gaq.push ['_trackEvent', 'Task', 'Reload', task[tid].name]
      if task[tid]
        task[tid].dl_size = 0
        task[tid].sub_task_ok = 0
        task[tid].status = STATUS.RELOAD
        task[tid].time = new Date().getTime() / 1000
      listen[TASK.TASK_RELOAD]? tid
    
    # Task filter
    $(doc.task.filter).delegate "li", 'click', ->
      reg = new RegExp '^filter-status-.+'
      target = []

      _gaq.push ['_trackEvent', 'Task', 'Status', $(this).attr('for')]
      
      for item in $(doc.task.list).attr('class').split ' '
        target.push item if reg.exec item
      $(doc.task.list).removeClass target.join ' ' if target.length > 0
      $(doc.task.list).addClass 'filter-status-'+$(this).attr('for')

      $(this).addClass "active"
      $(this).siblings().removeClass "active"

  task
)()