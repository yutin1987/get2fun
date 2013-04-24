$ ->
    $(window).resize () ->
        $(".task .wrapper-list").css("min-height",$(window).height()-203)
        $("#group .wrapper-overflow, #group .wrapper-list").height($(window).height()-203)

    $(window).resize()