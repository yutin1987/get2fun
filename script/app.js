$.filesize = function(t, e) {
    var s, r, i, a, n, o;
    for (null == e && (e = 0), a = [ "bytes", "KB", "MB", "GB", "TB" ], s = n = 0, o = a.length; o > n; s = ++n) if (r = a[s], 
    i = t / Math.pow(1024, s), 1024 > i) return 0 === s ? 0 === t ? "0KB" : "> 1KB" : i.toFixed(e) + a[s];
    return (t / Math.pow(1024, a.length - 1)).toFixed(e) + a[a.length - 1];
}, $.filesize = function(t, e) {
    var s, r, i, a, n, o;
    for (null == e && (e = 0), a = [ "bytes", "KB", "MB", "GB", "TB" ], s = n = 0, o = a.length; o > n; s = ++n) if (r = a[s], 
    i = t / Math.pow(1024, s), 1024 > i) return 0 === s ? 0 === t ? "0KB" : "> 1KB" : i.toFixed(e) + a[s];
    return (t / Math.pow(1024, a.length - 1)).toFixed(e) + a[a.length - 1];
};

var req_server, sys, watch_action;

sys = {
    time: 0,
    watch: null,
    user: null
}, req_server = function(t, e, s, r) {
    return null == e && (e = {}), e._ = Math.random(), $.ajax("http://" + ADDRESS + PATH + API.TASK + "?v=" + t, {
        type: "POST",
        data: e,
        dataType: "json",
        timeout: 2e3,
        success: function(t) {
            return 0 > t.code ? "function" == typeof r ? r(t) : void 0 : "function" == typeof s ? s(t.value) : void 0;
        },
        error: function() {
            return "function" == typeof r ? r({
                code: -400
            }) : void 0;
        }
    });
}, watch_action = function() {
    return req_server("get_tasks", {
        time: sys.time
    }, function(t) {
        return $("#control").addClass("online"), $("body").removeClass("guest"), $(t).each(function() {
            var t, e;
            return e = parseInt(this.tid), t = $.task[e], null == t ? $.task.push({
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
            }) : this.time >= t.time && (t.thumb = this.cover, t.time = this.time, t.status = this.status, 
            t.quality = this.quality, t.size = this.size, t.dl_size = this.dlSize, t.sub_task = this.subTaskTotal, 
            t.sub_task_ok = this.subTaskOk, this.time > sys.time) ? sys.time = this.time : void 0;
        }), sys.watch = setTimeout(watch_action, WATCH_TIME);
    }, function(t) {
        return $("#control").removeClass("online"), -2 === t.code && $("body").addClass("guest"), 
        sys.watch = setTimeout(watch_action, 5 * WATCH_TIME);
    });
}, $(function() {
    var t, e, s, r;
    return $("#logo").click(function() {
        return $("body").toggleClass("temp-green"), $("body").hasClass("temp-green") ? (_gaq.push([ "_trackEvent", "Configs", "setColor", "Green" ]), 
        $.cookie("temp", "temp-green", {
            expiress: 365
        })) : (_gaq.push([ "_trackEvent", "Configs", "setColor", "Blue" ]), $.removeCookie("temp"));
    }), "temp-green" === $.cookie("temp") && $("body").addClass("temp-green"), $(".box-nav .nav-clear").click(function() {
        return _gaq.push([ "_trackEvent", "Operate", "Clean", $.task.length ]), req_server("clear_tasks", {
            time: sys.time
        }), $($.task).each(function() {
            if (this) switch (this.status) {
              case STATUS.RELOAD:
              case STATUS.CANCEL:
              case STATUS.COMPLETE:
                if ("admin" === sys.user || this.owner === sys.user) return this.del();
            }
        });
    }), $(".box-nav .nav-refresh").click(function() {
        return _gaq.push([ "_trackEvent", "Operate", "Refresh", $.task.length ]), $.task.reset(), 
        sys.time = 0, t();
    }), $("#dialog-chrome a").click(function() {
        return _gaq.push([ "_trackEvent", "Check", "Is not chrome", $("#dialog-chrome .donot").is(":checked") ]), 
        $("body").removeClass("no-chrome"), $("#dialog-chrome .donot").is(":checked") && $.cookie("donot-chrome", "1", {
            expiress: 365
        }), !0;
    }), $.browser.chrome !== !0 && null == $.cookie("donot-chrome") && $("body").addClass("no-chrome"), 
    $("#dialog-ext a").click(function() {
        return _gaq.push([ "_trackEvent", "Check", "Not has ext", $("#dialog-ext .donot").is(":checked") ]), 
        $("body").addClass("has-ext"), $("#dialog-ext .donot").is(":checked") && $.cookie("donot-ext", "1", {
            expiress: 365
        }), !0;
    }), ($.browser.chrome !== !0 || null != $.cookie("donot-ext")) && $("body").addClass("has-ext"), 
    $("#dialog-qpkg a, #dialog-error a").click(function() {
        return $("body").removeClass("has-error no-qpkg"), !0;
    }), s = function(t) {
        return $.ajax("http://" + ADDRESS + PATH + API.INFO, {
            type: "POST",
            dataType: "json",
            data: {
                it: "server"
            },
            timeout: 14e3,
            success: function(e) {
                if (null != e.server) switch ("TRUE" !== e.server.qpkg_status ? $("body").addClass("no-qpkg") : 1 !== e.server.process_status || 0 === e.server.server_status ? $("body").addClass("has-error") : $("body").removeClass("no-qpkg has-error"), 
                e.server.server_status) {
                  case 0:
                    $("#control").attr("class", "server-stopped");
                    break;

                  case 1:
                    $("#control").attr("class", "server-running");
                    break;

                  case 2:
                    $("#control").attr("class", "server-paused");
                } else $("body").addClass("has-error");
                return t !== !1 ? setTimeout(s, 1e4) : void 0;
            },
            error: function() {
                return t !== !1 ? setTimeout(s, 1e4) : void 0;
            }
        });
    }, s(), r = function(t) {
        return $.ajax("http://" + ADDRESS + PATH + API.LOGIN + "?check", {
            type: "POST",
            dataType: "json",
            timeout: 14e3,
            success: function(e) {
                return "true" === e.status ? sys.user = e.user : $("body").addClass("guest"), t !== !1 ? setTimeout(r, 1e4) : void 0;
            },
            error: function() {
                return t !== !1 ? setTimeout(r, 1e4) : void 0;
            }
        });
    }, r(), $(".box-nav .nav-logout").click(function() {
        var t;
        return t = {
            _: Math.random(),
            user: "logout",
            pwd: "logout"
        }, sys.user = null, $(".login").removeClass("invalid"), $.ajax("http://" + ADDRESS + PATH + API.LOGIN + "?logout", {
            type: "POST",
            data: t,
            dataType: "json",
            timeout: 4e3
        });
    }), $.task.setListen(TASK.GROUP_CANCEL, function(t) {
        return t.length > 0 ? req_server("cancel_task", {
            tid: t
        }) : void 0;
    }), $.task.setListen(TASK.GROUP_RELOAD, function(t) {
        return t.length > 0 ? req_server("redownload_task", {
            tid: t
        }) : void 0;
    }), $.task.setListen(TASK.TASK_CANCEL, function(t) {
        return null != t ? req_server("cancel_task", {
            tid: [ t ]
        }) : void 0;
    }), $.task.setListen(TASK.TASK_RELOAD, function(t) {
        return null != t ? req_server("redownload_task", {
            tid: [ t ]
        }) : void 0;
    }), e = function() {
        var t, e, s;
        return s = $("#username").val(), e = $("#password").val(), t = {
            _: Math.random(),
            user: s,
            pwd: e
        }, $(".login").removeClass("invalid"), $(".login").addClass("proceed"), $.ajax("http://" + ADDRESS + PATH + API.LOGIN, {
            type: "POST",
            data: t,
            dataType: "json",
            timeout: 4e3,
            success: function(t) {
                return "true" == t + "" ? $("body").removeClass("guest") : ($(".login").addClass("invalid"), 
                $("body").addClass("guest")), sys.user = s, $(".login").removeClass("proceed");
            },
            error: function() {
                return $(".login").removeClass("proceed"), $("body").addClass("guest");
            }
        });
    }, $(".login").keypress(function(t) {
        var s;
        return s = t.keyCode || t.which, 13 === s ? e() : void 0;
    }), $("#login-submit").click(e), $(".login .remember").click(function() {
        return $(this).toggleClass("checked");
    }), $("#control").click(function() {
        return s(!1), $(this).hasClass("server-stopped") ? !1 : (req_server("pause_server"), 
        $(this).toggleClass("server-paused"));
    }), t = function() {
        return null != sys.watch && (clearTimeout(sys.watch), delete sys.watch), sys.watch = setTimeout(watch_action, WATCH_TIME);
    }, t();
});

var req_server, sys, watch_action;

sys = {
    time: 0,
    watch: null,
    user: null
}, req_server = function(t, e, s, r) {
    return null == e && (e = {}), e._ = Math.random(), $.ajax("http://" + ADDRESS + PATH + API.TASK + "?v=" + t, {
        type: "POST",
        data: e,
        dataType: "json",
        timeout: 2e3,
        success: function(t) {
            return 0 > t.code ? "function" == typeof r ? r(t) : void 0 : "function" == typeof s ? s(t.value) : void 0;
        },
        error: function() {
            return "function" == typeof r ? r({
                code: -400
            }) : void 0;
        }
    });
}, watch_action = function() {
    return req_server("get_tasks", {
        time: sys.time
    }, function(t) {
        return $("#control").addClass("online"), $("body").removeClass("guest"), $(t).each(function() {
            var t, e;
            return e = parseInt(this.tid), t = $.task[e], null == t ? $.task.push({
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
            }) : this.time >= t.time && (t.thumb = this.cover, t.time = this.time, t.status = this.status, 
            t.quality = this.quality, t.size = this.size, t.dl_size = this.dlSize, t.sub_task = this.subTaskTotal, 
            t.sub_task_ok = this.subTaskOk, this.time > sys.time) ? sys.time = this.time : void 0;
        }), sys.watch = setTimeout(watch_action, WATCH_TIME);
    }, function(t) {
        return $("#control").removeClass("online"), -2 === t.code && $("body").addClass("guest"), 
        sys.watch = setTimeout(watch_action, 5 * WATCH_TIME);
    });
}, $(function() {
    var t, e, s, r;
    return $("#logo").click(function() {
        return $("body").toggleClass("temp-green"), $("body").hasClass("temp-green") ? (_gaq.push([ "_trackEvent", "Configs", "setColor", "Green" ]), 
        $.cookie("temp", "temp-green", {
            expiress: 365
        })) : (_gaq.push([ "_trackEvent", "Configs", "setColor", "Blue" ]), $.removeCookie("temp"));
    }), "temp-green" === $.cookie("temp") && $("body").addClass("temp-green"), $(".box-nav .nav-refresh").click(function() {
        return _gaq.push([ "_trackEvent", "Operate", "Refresh", $.task.length ]), $.task.reset(), 
        sys.time = 0, t();
    }), $(".box-nav .nav-clear").click(function() {
        return _gaq.push([ "_trackEvent", "Operate", "Clean", $.task.length ]), req_server("clear_tasks", {
            time: sys.time
        }), $($.task).each(function() {
            if (this) switch (this.status) {
              case STATUS.RELOAD:
              case STATUS.CANCEL:
              case STATUS.COMPLETE:
                if ("admin" === sys.user || this.owner === sys.user) return this.del();
            }
        });
    }), $(".box-nav .nav-program").click(function() {
        return _gaq.push([ "_trackEvent", "Operate", "Program", "" ]);
    }), $(".box-nav .nav-fb").click(function() {
        return _gaq.push([ "_trackEvent", "Operate", "Facebook", "" ]);
    }), $(".box-nav .nav-ext").click(function() {
        return _gaq.push([ "_trackEvent", "Operate", "Extension", "" ]);
    }), $(".box-nav .nav-logout").click(function() {
        var t;
        return _gaq.push([ "_trackEvent", "Operate", "logout", sys.user ]), t = {
            _: Math.random(),
            user: "logout",
            pwd: "logout"
        }, sys.user = null, $(".login").removeClass("invalid"), $.ajax("http://" + ADDRESS + PATH + API.LOGIN + "?logout", {
            type: "POST",
            data: t,
            dataType: "json",
            timeout: 4e3
        });
    }), $("#dialog-chrome a").click(function() {
        return _gaq.push([ "_trackEvent", "Check", "Is not chrome", $("#dialog-chrome .donot").is(":checked") ]), 
        $("body").removeClass("no-chrome"), $("#dialog-chrome .donot").is(":checked") && $.cookie("donot-chrome", "1", {
            expiress: 365
        }), !0;
    }), $.browser.chrome !== !0 && null == $.cookie("donot-chrome") && $("body").addClass("no-chrome"), 
    $("#dialog-ext a").click(function() {
        return _gaq.push([ "_trackEvent", "Check", "Not has ext", $("#dialog-ext .donot").is(":checked") ]), 
        $("body").addClass("has-ext"), $("#dialog-ext .donot").is(":checked") && $.cookie("donot-ext", "1", {
            expiress: 365
        }), !0;
    }), ($.browser.chrome !== !0 || null != $.cookie("donot-ext")) && $("body").addClass("has-ext"), 
    $("#dialog-qpkg a, #dialog-error a").click(function() {
        return $("body").removeClass("has-error no-qpkg"), !0;
    }), s = function(t) {
        return $.ajax("http://" + ADDRESS + PATH + API.INFO, {
            type: "POST",
            dataType: "json",
            data: {
                it: "server"
            },
            timeout: 14e3,
            success: function(e) {
                if (null != e.server) switch ("TRUE" !== e.server.qpkg_status ? $("body").addClass("no-qpkg") : 1 !== e.server.process_status || 0 === e.server.server_status ? $("body").addClass("has-error") : $("body").removeClass("no-qpkg has-error"), 
                e.server.server_status) {
                  case 0:
                    $("#control").attr("class", "server-stopped");
                    break;

                  case 1:
                    $("#control").attr("class", "server-running");
                    break;

                  case 2:
                    $("#control").attr("class", "server-paused");
                } else $("body").addClass("has-error");
                return t !== !1 ? setTimeout(s, 1e4) : void 0;
            },
            error: function() {
                return t !== !1 ? setTimeout(s, 1e4) : void 0;
            }
        });
    }, s(), r = function(t) {
        return $.ajax("http://" + ADDRESS + PATH + API.LOGIN + "?check", {
            type: "POST",
            dataType: "json",
            timeout: 14e3,
            success: function(e) {
                return "true" === e.status ? sys.user = e.user : $("body").addClass("guest"), t !== !1 ? setTimeout(r, 1e4) : void 0;
            },
            error: function() {
                return t !== !1 ? setTimeout(r, 1e4) : void 0;
            }
        });
    }, r(), $.task.setListen(TASK.GROUP_CANCEL, function(t) {
        return t.length > 0 ? req_server("cancel_task", {
            tid: t
        }) : void 0;
    }), $.task.setListen(TASK.GROUP_RELOAD, function(t) {
        return t.length > 0 ? req_server("redownload_task", {
            tid: t
        }) : void 0;
    }), $.task.setListen(TASK.TASK_CANCEL, function(t) {
        return null != t ? req_server("cancel_task", {
            tid: [ t ]
        }) : void 0;
    }), $.task.setListen(TASK.TASK_RELOAD, function(t) {
        return null != t ? req_server("redownload_task", {
            tid: [ t ]
        }) : void 0;
    }), e = function() {
        var t, e, s;
        return s = $("#username").val(), e = $("#password").val(), t = {
            _: Math.random(),
            user: s,
            pwd: e
        }, $(".login").removeClass("invalid"), $(".login").addClass("proceed"), $.ajax("http://" + ADDRESS + PATH + API.LOGIN, {
            type: "POST",
            data: t,
            dataType: "json",
            timeout: 4e3,
            success: function(t) {
                return "true" == t + "" ? $("body").removeClass("guest") : ($(".login").addClass("invalid"), 
                $("body").addClass("guest")), sys.user = s, $(".login").removeClass("proceed");
            },
            error: function() {
                return $(".login").removeClass("proceed"), $("body").addClass("guest");
            }
        });
    }, $(".login").keypress(function(t) {
        var s;
        return s = t.keyCode || t.which, 13 === s ? e() : void 0;
    }), $("#login-submit").click(e), $(".login .remember").click(function() {
        return $(this).toggleClass("checked");
    }), $("#control").click(function() {
        return s(!1), $(this).hasClass("server-stopped") ? !1 : (req_server("pause_server"), 
        $(this).toggleClass("server-paused"));
    }), t = function() {
        return null != sys.watch && (clearTimeout(sys.watch), delete sys.watch), sys.watch = setTimeout(watch_action, WATCH_TIME);
    }, t();
}), $(function() {
    return $(window).resize(function() {
        return $(".task .wrapper-list").css("min-height", $(window).height() - 203), $("#group .wrapper-overflow, #group .wrapper-list").height($(window).height() - 203);
    }), $(window).resize();
});

var TASK, __hasProp = {}.hasOwnProperty, __extends = function(t, e) {
    function s() {
        this.constructor = t;
    }
    for (var r in e) __hasProp.call(e, r) && (t[r] = e[r]);
    return s.prototype = e.prototype, t.prototype = new s(), t.__super__ = e.prototype, 
    t;
};

TASK = {
    TASK_CANCEL: 0,
    TASK_RELOAD: 1,
    GROUP_CANCEL: 2,
    GROUP_RELOAD: 3
}, $.task = function() {
    var t, e, s, r, i, a, n;
    return s = {
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
    }, i = [], t = function(t) {
        function e(t) {
            return t instanceof jQuery && $(t).data("GroupData") ? $(t).data("GroupData") : (t.tag = null, 
            this.dltag = null, this.sum = [ 0, 0, 0, 0, 0, 0 ], Object.defineProperty(this, "name", {
                get: function() {
                    return t.name;
                }
            }), Object.defineProperty(this, "tag", {
                get: function() {
                    var e, r, i, a, n;
                    if (null == t.tag) for (t.tag = s.group.sample.clone(), t.tag.data("GroupData", this).attr("key", t.name), 
                    $(".name", t.tag).text(t.name), n = [ "thumb", "owner", "src_type", "status" ], 
                    i = 0, a = n.length; a > i; i++) r = n[i], e = this[r], delete t[r], this[r] = e;
                    return t.tag;
                }
            }), Object.defineProperty(this, "thumb", {
                get: function() {
                    return t.thumb || "";
                },
                set: function(e) {
                    return t.thumb = e, $(".thumb .img", this.tag).empty().append($("<img onerror=\"this.src='data:image/gif;base64,R0lGODlhAwADAIAAAAAAAP///yH5BAEHAAEALAAAAAADAAMAAAIDjH8FADs='\" />").attr("src", e)), 
                    null != this.dltag ? $(".thumb .img", this.dltag).empty().append($("<img onerror=\"this.src='data:image/gif;base64,R0lGODlhAwADAIAAAAAAAP///yH5BAEHAAEALAAAAAADAAMAAAIDjH8FADs='\" />").attr("src", e)) : void 0;
                }
            }), Object.defineProperty(this, "owner", {
                get: function() {
                    return t.owner || "";
                },
                set: function(e) {
                    var s;
                    if (null != e && (e = e.toLowerCase(), null == this.owner || this.owner.toLowerCase() !== e)) return s = this.owner, 
                    t.owner = this.owner ? "multiple" : e, this.tag.removeClass("owner-" + s), this.tag.addClass("owner-" + this.owner), 
                    null != this.dltag && (this.dltag.removeClass("owner-" + s), this.dltag.addClass("owner-" + this.owner)), 
                    r.owner = this.owner;
                }
            }), Object.defineProperty(this, "src_type", {
                get: function() {
                    return t.src_type;
                },
                set: function(e) {
                    var s;
                    if (null != e && (e = e.toLowerCase(), null == this.src_type || this.src_type.toLowerCase() !== e)) return s = this.src_type, 
                    t.src_type = this.src_type ? "multiple" : e, this.tag.removeClass("src-" + s), this.tag.addClass("src-" + this.src_type), 
                    null != this.dltag && (this.dltag.removeClass("src-" + s), this.dltag.addClass("src-" + this.src_type)), 
                    r.src = this.src_type;
                }
            }), Object.defineProperty(this, "status", {
                get: function() {
                    return t.status;
                },
                set: function(e) {
                    return this.tag.removeClass("status-" + STATUS_NAME[t.status]), this.tag.addClass("status-" + STATUS_NAME[e]), 
                    null != this.dltag && (this.dltag.removeClass("status-" + STATUS_NAME[t.status]), 
                    this.dltag.addClass("status-" + STATUS_NAME[e])), t.status = e, $(".total", this.tag).text(this.sum[STATUS.COMPLETE] + " / " + this.length), 
                    null != this.dltag ? $(".total", this.dltag).text(this.sum[STATUS.COMPLETE] + " / " + this.length) : void 0;
                }
            }), void 0);
        }
        return __extends(e, t), e.prototype.push = function(t) {
            return Array.prototype.push.call(this, t), this.toggle(!1, t.status), null != t.thumb && (this.thumb = t.thumb), 
            this.owner = t.owner, this.src_type = t.src_type, this;
        }, e.prototype.del = function(t) {
            var e;
            return e = $.inArray(t, this), e > -1 && (this.splice(e, 1), this.toggle(t.status, !1), 
            this.length > 0 || (r.del(this), $(this.tag).fadeOut(500, function() {
                return $(this).remove();
            }), null != this.dltag && $(this.dltag).fadeOut(500, function() {
                return $(this).remove();
            }))), this;
        }, e.prototype.toggle = function(t, e) {
            return null != t && t !== !1 && this.sum[t]--, null != e && e !== !1 && this.sum[e]++, 
            this.status = 1 > this.sum[STATUS.WAIT] + this.sum[STATUS.DOWNLOAD] ? this.sum[STATUS.FAIL] > 0 ? STATUS.FAIL : this.sum[STATUS.COMPLETE] > 0 ? STATUS.COMPLETE : STATUS.CANCEL : this.sum[STATUS.DOWNLOAD] > 0 ? STATUS.DOWNLOAD : STATUS.WAIT;
        }, e;
    }(Array), $.group = r = new (function(e) {
        function r() {
            Object.defineProperty(this, "owner", {
                get: function() {
                    return i.filter.owner;
                },
                set: function(t) {
                    return null != t && (t = t.toLowerCase(), 0 > i.filter.owner_list.indexOf(t)) ? (i.filter.owner_list.push(t), 
                    $("#filter-owner select", s.group.filter).append($("<option />").text(t)), $("#filter").html($("#filter").html() + " #group .filter-owner-" + t + " .item:not(.owner-" + t + "){ height: 0px;border: none;}")) : void 0;
                }
            }), Object.defineProperty(this, "src", {
                get: function() {
                    return i.filter.src;
                },
                set: function(t) {
                    return null != t && (t = t.toLowerCase(), 0 > i.filter.src_list.indexOf(t)) ? (i.filter.src_list.push(t), 
                    $("#filter-src select", s.group.filter).append($("<option />").text(t)), $("#filter").html($("#filter").html() + " #group .filter-src-" + t + " .item:not(.src-" + t + "){ height: 0px;border: none;}")) : void 0;
                }
            });
        }
        var i;
        return __extends(r, e), i = {
            index: 0,
            data: {},
            filter: {
                owner: null,
                owner_list: [],
                src: null,
                src_list: []
            }
        }, r.prototype.push = function(e) {
            return e = new t(e), i.data[e.name] = e, Array.prototype.push.call(this, e), 1 === this.length && a.toggleGroup(e), 
            e;
        }, r.prototype.get = function(t) {
            return i.data[t];
        }, r.prototype.del = function(t) {
            var e;
            return delete i.data[t.name], e = $.inArray(t, this), e > -1 && this.splice(e, 1), 
            this;
        }, r.prototype.reset = function() {
            for (i.index = 0, i.data = {}; this.length > 0; ) this.pop();
            return i.filter = {
                owner: null,
                owner_list: [],
                src: null,
                src_list: []
            }, $(".item", s.group.list).remove(), $(".item", s.group.download).remove(), $("#filter-owner option", s.group.filter).slice(1).remove(), 
            $("#filter-src option", s.group.filter).slice(1).remove(), $("#filter").empty(), 
            this.owner = "multiple", this.src = "multiple", this;
        }, r.prototype.draw = function() {
            var t, e;
            if (i.index >= this.length) return i.index = this.length;
            if (e = s.group.cursor.offset().top - $(window).scrollTop(), 1.5 * $(window).height() > e) for (t = []; ;) if (t.push(this[i.index].tag), 
            i.index++, !(i.index % 5 > 0 && i.index < this.length)) break;
            return s.group.cursor.before(t), this;
        }, r;
    }(Array))(), e = function() {
        function t(t) {
            return t instanceof jQuery && $(t).data("TaskData") ? $(t).data("TaskData") : (t.tid = parseInt(t.tid), 
            t.status = parseInt(t.status), Object.defineProperty(this, "tid", {
                value: t.tid,
                writeable: !1
            }), Object.defineProperty(this, "playlist", {
                value: t.playlist,
                writeable: !1
            }), Object.defineProperty(this, "name", {
                value: t.name,
                writeable: !1
            }), Object.defineProperty(this, "owner", {
                value: t.owner,
                writeable: !1
            }), Object.defineProperty(this, "src_type", {
                value: t.src_type,
                writeable: !1
            }), Object.defineProperty(this, "src", {
                value: t.src,
                writeable: !1
            }), Object.defineProperty(this, "time", {
                get: function() {
                    return t.time;
                },
                set: function(e) {
                    return t.time = parseInt(e);
                }
            }), Object.defineProperty(this, "tag", {
                get: function() {
                    var e, r, i, a, n;
                    if (null == t.tag) for (t.tag = s.task.sample.clone(), this.tag.data("TaskData", this).attr("tid", this.tid), 
                    this.tag.addClass("src-" + t.src_type.toLowerCase()), $(".thumb", this.tag).attr("href", this.src || "#"), 
                    $(".name", this.tag).text(this.name), $(".owner", this.tag).text(this.owner), this.tag.addClass("status-" + STATUS_NAME[this.status]), 
                    n = [ "added_time", "thumb", "quality", "size", "dl_size", "sub_task", "sub_task_ok" ], 
                    i = 0, a = n.length; a > i; i++) r = n[i], e = this[r], t[r] = null, this[r] = e;
                    return t.tag;
                }
            }), Object.defineProperty(this, "status", {
                get: function() {
                    return t.status;
                },
                set: function(e) {
                    var s, i;
                    return i = this.status, t.status = parseInt(e), this.status !== i && (s = r.get(this.playlist), 
                    s.toggle(i, this.status)), this.status === STATUS.DOWNLOAD ? a.download = this : a.download === this && (a.download = !1), 
                    this.tag.removeClass("status-" + STATUS_NAME[i]), this.tag.addClass("status-" + STATUS_NAME[this.status]), 
                    null != this.dltag ? (this.dltag.removeClass("status-" + STATUS_NAME[i]), this.dltag.addClass("status-" + STATUS_NAME[this.status])) : void 0;
                }
            }), Object.defineProperty(this, "quality", {
                get: function() {
                    return t.quality;
                },
                set: function(e) {
                    var s, r, i, a;
                    if (r = "", null != e) for (i = 0, a = e.length; a > i; i++) if (s = e[i], null != s) {
                        if (s = s.toLowerCase(), "" !== r && r !== s) {
                            r = "multi";
                            break;
                        }
                        r = s;
                    }
                    return $(".quality", this.tag).attr("class", "quality quality-" + r), t.quality = e;
                }
            }), Object.defineProperty(this, "added_time", {
                get: function() {
                    return t.added_time;
                },
                set: function(e) {
                    return $(".time", this.tag).text(new Date(1e3 * e).toFormat("yyyy-MM-dd")), null != this.dltag && $(".time", this.dltag).text(new Date(1e3 * e).toFormat("yyyy-MM-dd")), 
                    t.added_time = e;
                }
            }), Object.defineProperty(this, "thumb", {
                get: function() {
                    return t.thumb;
                },
                set: function(e) {
                    var s;
                    if (e !== this.thumb) return null != (s = r.get(this.playlist)) && (s.thumb = e), 
                    $(".thumb .img", this.tag).empty().append($("<img onerror=\"this.src='data:image/gif;base64,R0lGODlhAwADAIAAAAAAAP///yH5BAEHAAEALAAAAAADAAMAAAIDjH8FADs='\" />").attr("src", e)), 
                    null != this.dltag && $(".thumb .img", this.dltag).empty().append($("<img onerror=\"this.src='data:image/gif;base64,R0lGODlhAwADAIAAAAAAAP///yH5BAEHAAEALAAAAAADAAMAAAIDjH8FADs='\" />").attr("src", e)), 
                    t.thumb = e;
                }
            }), Object.defineProperty(this, "size", {
                get: function() {
                    return t.size;
                },
                set: function(e) {
                    if (t.size = parseInt(e) || 0, 1 > this.size) {
                        if ($(".est-size, dl-size", this.tag).empty(), this.dltag) return $(".est-size, dl-size", this.dltag).empty();
                    } else if ($(".est-size", this.tag).html("&nbsp;/&nbsp;" + $.filesize(this.size)), 
                    this.dltag) return $(".est-size", this.dltag).html("&nbsp;/&nbsp;" + $.filesize(this.size));
                }
            }), Object.defineProperty(this, "dl_size", {
                get: function() {
                    return t.dl_size;
                },
                set: function(e) {
                    return t.dl_size = parseInt(e) || 0, $(".dl-size", this.tag).text($.filesize(this.dl_size)), 
                    this.dltag && $(".dl-size", this.dltag).text($.filesize(this.dl_size)), $(".bar", this.tag).width(100 * (this.dl_size / this.size) + "%"), 
                    this.dltag ? $(".bar", this.dltag).width(100 * (this.dl_size / this.size) + "%") : void 0;
                }
            }), Object.defineProperty(this, "sub_task", {
                get: function() {
                    return t.sub_task || 0;
                },
                set: function(e) {
                    return t.sub_task = parseInt(e) || 0, this.sub_task > 0 && ($(this.tag).addClass("has-sub"), 
                    $(".total-sub", this.tag).html("&nbsp;/&nbsp;" + this.sub_task), this.dltag && $(".total-sub", this.dltag).html("&nbsp;/&nbsp;" + this.sub_task), 
                    $(".bar", this.tag).width(100 * (this.sub_task_ok / this.sub_task) + "%"), this.dltag) ? $(".bar", this.dltag).width(100 * (this.sub_task_ok / this.sub_task) + "%") : void 0;
                }
            }), Object.defineProperty(this, "sub_task_ok", {
                get: function() {
                    return t.sub_task_ok || 0;
                },
                set: function(e) {
                    return t.sub_task_ok = parseInt(e) || 0, $(".ok-sub", this.tag).text(this.sub_task_ok), 
                    this.dltag && $(".ok-sub", this.dltag).text(this.sub_task_ok), this.sub_task > 0 && ($(".bar", this.tag).width(100 * (this.sub_task_ok / this.sub_task) + "%"), 
                    this.dltag) ? $(".bar", this.dltag).width(100 * (this.sub_task_ok / this.sub_task) + "%") : void 0;
                }
            }), void 0);
        }
        return t.prototype.dltag = null, t.prototype.del = function() {
            return $(this.tag).fadeOut(500, function() {
                return $(this).remove();
            }), this.dltag && $(this.dltag).fadeOut(500, function() {
                return $(this).remove();
            }), delete a[this.tid], r.get(this.playlist).del(this);
        }, t;
    }(), a = [], n = {
        index: 0,
        download: !1,
        group: null,
        auto_review: null
    }, Object.defineProperty(a, "download", {
        get: function() {
            return n.download;
        },
        set: function(t) {
            var e, i;
            return i = this.download, i !== t ? (i !== !1 && (i.status === STATUS.DOWNLOAD && (i.time = new Date().getTime() / 1e3, 
            i.status = STATUS.COMPLETE), null != i.dltag && (i.dltag.remove(), i.dltag = null), 
            e = r.get(i.playlist), null != e.dltag && (e.dltag.remove(), e.dltag = null)), t && (t.dltag || (t.dltag = t.tag.clone()), 
            $(".item", s.task.download).is(t.dltag) || s.task.download.append(t.dltag), e = r.get(t.playlist), 
            null == e.dltag && (e.dltag = e.tag.clone()), $(".item", s.group.download).is(e.dltag) || s.group.download.append(e.dltag)), 
            n.download = t) : void 0;
        }
    }), a.push = function(t) {
        return $(t).each(function() {
            var t, s;
            return s = new e(this), a[s.tid] = s, t = r.get(s.playlist), t || (t = r.push({
                name: s.playlist,
                owner: s.owner,
                thumb: s.thumb,
                src: s.src_type
            })), t.push(s);
        });
    }, a.reset = function() {
        for (var t; this.length > 0; ) this.pop();
        return t = !1, r.reset(), this.toggleGroup(), $(".item", s.task.download).remove(), 
        this;
    }, a.toggleGroup = function(t) {
        var e;
        return e = null, n.group = null != t ? t : null, null != n.auto_review && (clearInterval(n.auto_review), 
        delete n.auto_review), $(".item", s.task.list).remove(), n.index = 0, n.auto_review = setInterval(function() {
            return r.draw(), a.draw();
        }, 300);
    }, a.draw = function() {
        var t, e;
        if (!(null != n.group && n.index < n.group.length)) return this;
        if (e = s.task.cursor.offset().top - $(window).scrollTop(), 1.5 * $(window).height() > e) {
            for (t = []; ;) if (t.push(n.group[n.index].tag), n.index++, !(n.index % 5 > 0 && n.index < n.group.length)) break;
            return s.task.cursor.before(t);
        }
    }, a.setListen = function(t, e) {
        return i[t] = e;
    }, $(function() {
        var e, n;
        return e = $("#group"), s.group = {
            download: $(".wrapper-download .download", e),
            list: $(".wrapper-list", e),
            sample: $(".item", e).detach(),
            cursor: $(".wrapper-list .none", e),
            filter: $(".wrapper-filter .filter", e)
        }, n = $(".task"), s.task = {
            download: $(".wrapper-download .download", n),
            list: $(".wrapper-list", n),
            sample: $(".item", n).detach(),
            cursor: $(".wrapper-list .none", n),
            filter: $(".wrapper-filter .filter", n)
        }, a.reset(), $(".item", e).live("click", function() {
            var t;
            return t = r.get($(this).attr("key")), _gaq.push([ "_trackEvent", "Group", "See", t.name ]), 
            a.toggleGroup(t);
        }), $(".cancel", e).live("click", function() {
            var e, s, r, a;
            return r = $(this).parents(".item:first"), e = new t(r), _gaq.push([ "_trackEvent", "Group", "Cancel", e.name ]), 
            s = [], $(e).each(function() {
                switch (this.status) {
                  case STATUS.CANCEL:
                  case STATUS.COMPLETE:
                    break;

                  default:
                    return this.status = STATUS.CANCEL, this.time = new Date().getTime() / 1e3, s.push(this.tid);
                }
            }), "function" == typeof i[a = TASK.GROUP_CANCEL] ? i[a](s) : void 0;
        }), $(".reload", e).live("click", function() {
            var e, s, r, a;
            return r = $(this).parents(".item:first"), e = new t(r), _gaq.push([ "_trackEvent", "Group", "Reload", e.name ]), 
            s = [], $(e).each(function() {
                switch (this.status) {
                  case STATUS.RELOAD:
                  case STATUS.WAIT:
                    break;

                  default:
                    return this.dl_size = 0, this.sub_task_ok = 0, this.status = STATUS.RELOAD, this.time = new Date().getTime() / 1e3, 
                    s.push(this.tid);
                }
            }), "function" == typeof i[a = TASK.GROUP_RELOAD] ? i[a](s) : void 0;
        }), $("select", s.group.filter).on("change", function() {
            var t, e, r, i, a, n, o, l, u;
            for (t = $(this).parent().attr("id"), r = RegExp("^" + t + "-.+"), i = $("option:selected", this), 
            n = i.val(), a = [], _gaq.push([ "_trackEvent", "Group", t, n ]), $(this).prev().text(i.text()), 
            u = $(s.group.list).attr("class").split(" "), o = 0, l = u.length; l > o; o++) e = u[o], 
            r.exec(e) && a.push(e);
            return a.length > 0 && $(s.group.list).removeClass(a.join(" ")), i.is(":first-child") ? void 0 : $(s.group.list).addClass(t + "-" + n);
        }).change(), $(".cancel", n).live("click", function() {
            var t, e, s;
            return e = $(this).parents(".item:first"), t = e.attr("tid"), _gaq.push([ "_trackEvent", "Task", "Cancel", a[t].name ]), 
            a[t] && (a[t].status = STATUS.CANCEL, a[t].time = new Date().getTime() / 1e3), "function" == typeof i[s = TASK.TASK_CANCEL] ? i[s](t) : void 0;
        }), $(".reload", n).live("click", function() {
            var t, e, s;
            return e = $(this).parents(".item:first"), t = e.attr("tid"), _gaq.push([ "_trackEvent", "Task", "Reload", a[t].name ]), 
            a[t] && (a[t].dl_size = 0, a[t].sub_task_ok = 0, a[t].status = STATUS.RELOAD, a[t].time = new Date().getTime() / 1e3), 
            "function" == typeof i[s = TASK.TASK_RELOAD] ? i[s](t) : void 0;
        }), $(s.task.filter).delegate("li", "click", function() {
            var t, e, r, i, a, n;
            for (e = RegExp("^filter-status-.+"), r = [], _gaq.push([ "_trackEvent", "Task", "Status", $(this).attr("for") ]), 
            n = $(s.task.list).attr("class").split(" "), i = 0, a = n.length; a > i; i++) t = n[i], 
            e.exec(t) && r.push(t);
            return r.length > 0 && $(s.task.list).removeClass(r.join(" ")), $(s.task.list).addClass("filter-status-" + $(this).attr("for")), 
            $(this).addClass("active"), $(this).siblings().removeClass("active");
        });
    }), a;
}(), $(function() {
    return $(window).resize(function() {
        return $(".task .wrapper-list").css("min-height", $(window).height() - 203), $("#group .wrapper-overflow, #group .wrapper-list").height($(window).height() - 203);
    }), $(window).resize();
});

var TASK, __hasProp = {}.hasOwnProperty, __extends = function(t, e) {
    function s() {
        this.constructor = t;
    }
    for (var r in e) __hasProp.call(e, r) && (t[r] = e[r]);
    return s.prototype = e.prototype, t.prototype = new s(), t.__super__ = e.prototype, 
    t;
};

TASK = {
    TASK_CANCEL: 0,
    TASK_RELOAD: 1,
    GROUP_CANCEL: 2,
    GROUP_RELOAD: 3
}, $.task = function() {
    var t, e, s, r, i, a, n;
    return s = {
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
    }, i = [], t = function(t) {
        function e(t) {
            return t instanceof jQuery && $(t).data("GroupData") ? $(t).data("GroupData") : (t.tag = null, 
            this.dltag = null, this.sum = [ 0, 0, 0, 0, 0, 0 ], Object.defineProperty(this, "name", {
                get: function() {
                    return t.name;
                }
            }), Object.defineProperty(this, "tag", {
                get: function() {
                    var e, r, i, a, n;
                    if (null == t.tag) for (t.tag = s.group.sample.clone(), t.tag.data("GroupData", this).attr("key", t.name), 
                    $(".name", t.tag).text(t.name), n = [ "thumb", "owner", "src_type", "status" ], 
                    i = 0, a = n.length; a > i; i++) r = n[i], e = this[r], delete t[r], this[r] = e;
                    return t.tag;
                }
            }), Object.defineProperty(this, "thumb", {
                get: function() {
                    return t.thumb || "";
                },
                set: function(e) {
                    return t.thumb = e, $(".thumb .img", this.tag).empty().append($("<img onerror=\"this.src='data:image/gif;base64,R0lGODlhAwADAIAAAAAAAP///yH5BAEHAAEALAAAAAADAAMAAAIDjH8FADs='\" />").attr("src", e)), 
                    null != this.dltag ? $(".thumb .img", this.dltag).empty().append($("<img onerror=\"this.src='data:image/gif;base64,R0lGODlhAwADAIAAAAAAAP///yH5BAEHAAEALAAAAAADAAMAAAIDjH8FADs='\" />").attr("src", e)) : void 0;
                }
            }), Object.defineProperty(this, "owner", {
                get: function() {
                    return t.owner || "";
                },
                set: function(e) {
                    var s;
                    if (null != e && (e = e.toLowerCase(), null == this.owner || this.owner.toLowerCase() !== e)) return s = this.owner, 
                    t.owner = this.owner ? "multiple" : e, this.tag.removeClass("owner-" + s), this.tag.addClass("owner-" + this.owner), 
                    null != this.dltag && (this.dltag.removeClass("owner-" + s), this.dltag.addClass("owner-" + this.owner)), 
                    r.owner = this.owner;
                }
            }), Object.defineProperty(this, "src_type", {
                get: function() {
                    return t.src_type;
                },
                set: function(e) {
                    var s;
                    if (null != e && (e = e.toLowerCase(), null == this.src_type || this.src_type.toLowerCase() !== e)) return s = this.src_type, 
                    t.src_type = this.src_type ? "multiple" : e, this.tag.removeClass("src-" + s), this.tag.addClass("src-" + this.src_type), 
                    null != this.dltag && (this.dltag.removeClass("src-" + s), this.dltag.addClass("src-" + this.src_type)), 
                    r.src = this.src_type;
                }
            }), Object.defineProperty(this, "status", {
                get: function() {
                    return t.status;
                },
                set: function(e) {
                    return this.tag.removeClass("status-" + STATUS_NAME[t.status]), this.tag.addClass("status-" + STATUS_NAME[e]), 
                    null != this.dltag && (this.dltag.removeClass("status-" + STATUS_NAME[t.status]), 
                    this.dltag.addClass("status-" + STATUS_NAME[e])), t.status = e, $(".total", this.tag).text(this.sum[STATUS.COMPLETE] + " / " + this.length), 
                    null != this.dltag ? $(".total", this.dltag).text(this.sum[STATUS.COMPLETE] + " / " + this.length) : void 0;
                }
            }), void 0);
        }
        return __extends(e, t), e.prototype.push = function(t) {
            return Array.prototype.push.call(this, t), this.toggle(!1, t.status), null != t.thumb && (this.thumb = t.thumb), 
            this.owner = t.owner, this.src_type = t.src_type, this;
        }, e.prototype.del = function(t) {
            var e;
            return e = $.inArray(t, this), e > -1 && (this.splice(e, 1), this.toggle(t.status, !1), 
            this.length > 0 || (r.del(this), $(this.tag).fadeOut(500, function() {
                return $(this).remove();
            }), null != this.dltag && $(this.dltag).fadeOut(500, function() {
                return $(this).remove();
            }))), this;
        }, e.prototype.toggle = function(t, e) {
            return null != t && t !== !1 && this.sum[t]--, null != e && e !== !1 && this.sum[e]++, 
            this.status = 1 > this.sum[STATUS.WAIT] + this.sum[STATUS.DOWNLOAD] ? this.sum[STATUS.FAIL] > 0 ? STATUS.FAIL : this.sum[STATUS.COMPLETE] > 0 ? STATUS.COMPLETE : STATUS.CANCEL : this.sum[STATUS.DOWNLOAD] > 0 ? STATUS.DOWNLOAD : STATUS.WAIT;
        }, e;
    }(Array), $.group = r = new (function(e) {
        function r() {
            Object.defineProperty(this, "owner", {
                get: function() {
                    return i.filter.owner;
                },
                set: function(t) {
                    return null != t && (t = t.toLowerCase(), 0 > i.filter.owner_list.indexOf(t)) ? (i.filter.owner_list.push(t), 
                    $("#filter-owner select", s.group.filter).append($("<option />").text(t)), $("#filter").html($("#filter").html() + " #group .filter-owner-" + t + " .item:not(.owner-" + t + "){ height: 0px;border: none;}")) : void 0;
                }
            }), Object.defineProperty(this, "src", {
                get: function() {
                    return i.filter.src;
                },
                set: function(t) {
                    return null != t && (t = t.toLowerCase(), 0 > i.filter.src_list.indexOf(t)) ? (i.filter.src_list.push(t), 
                    $("#filter-src select", s.group.filter).append($("<option />").text(t)), $("#filter").html($("#filter").html() + " #group .filter-src-" + t + " .item:not(.src-" + t + "){ height: 0px;border: none;}")) : void 0;
                }
            });
        }
        var i;
        return __extends(r, e), i = {
            index: 0,
            data: {},
            filter: {
                owner: null,
                owner_list: [],
                src: null,
                src_list: []
            }
        }, r.prototype.push = function(e) {
            return e = new t(e), i.data[e.name] = e, Array.prototype.push.call(this, e), 1 === this.length && a.toggleGroup(e), 
            e;
        }, r.prototype.get = function(t) {
            return i.data[t];
        }, r.prototype.del = function(t) {
            var e;
            return delete i.data[t.name], e = $.inArray(t, this), e > -1 && this.splice(e, 1), 
            this;
        }, r.prototype.reset = function() {
            for (i.index = 0, i.data = {}; this.length > 0; ) this.pop();
            return i.filter = {
                owner: null,
                owner_list: [],
                src: null,
                src_list: []
            }, $(".item", s.group.list).remove(), $(".item", s.group.download).remove(), $("#filter-owner option", s.group.filter).slice(1).remove(), 
            $("#filter-src option", s.group.filter).slice(1).remove(), $("#filter").empty(), 
            this.owner = "multiple", this.src = "multiple", this;
        }, r.prototype.draw = function() {
            var t, e;
            if (i.index >= this.length) return i.index = this.length;
            if (e = s.group.cursor.offset().top - $(window).scrollTop(), 1.5 * $(window).height() > e) for (t = []; ;) if (t.push(this[i.index].tag), 
            i.index++, !(i.index % 5 > 0 && i.index < this.length)) break;
            return s.group.cursor.before(t), this;
        }, r;
    }(Array))(), e = function() {
        function t(t) {
            return t instanceof jQuery && $(t).data("TaskData") ? $(t).data("TaskData") : (t.tid = parseInt(t.tid), 
            t.status = parseInt(t.status), Object.defineProperty(this, "tid", {
                value: t.tid,
                writeable: !1
            }), Object.defineProperty(this, "playlist", {
                value: t.playlist,
                writeable: !1
            }), Object.defineProperty(this, "name", {
                value: t.name,
                writeable: !1
            }), Object.defineProperty(this, "owner", {
                value: t.owner,
                writeable: !1
            }), Object.defineProperty(this, "src_type", {
                value: t.src_type,
                writeable: !1
            }), Object.defineProperty(this, "src", {
                value: t.src,
                writeable: !1
            }), Object.defineProperty(this, "time", {
                get: function() {
                    return t.time;
                },
                set: function(e) {
                    return t.time = parseInt(e);
                }
            }), Object.defineProperty(this, "tag", {
                get: function() {
                    var e, r, i, a, n;
                    if (null == t.tag) for (t.tag = s.task.sample.clone(), this.tag.data("TaskData", this).attr("tid", this.tid), 
                    this.tag.addClass("src-" + t.src_type.toLowerCase()), $(".thumb", this.tag).attr("href", this.src || "#"), 
                    $(".name", this.tag).text(this.name), $(".owner", this.tag).text(this.owner), this.tag.addClass("status-" + STATUS_NAME[this.status]), 
                    n = [ "added_time", "thumb", "quality", "size", "dl_size", "sub_task", "sub_task_ok" ], 
                    i = 0, a = n.length; a > i; i++) r = n[i], e = this[r], t[r] = null, this[r] = e;
                    return t.tag;
                }
            }), Object.defineProperty(this, "status", {
                get: function() {
                    return t.status;
                },
                set: function(e) {
                    var s, i;
                    return i = this.status, t.status = parseInt(e), this.status !== i && (s = r.get(this.playlist), 
                    s.toggle(i, this.status)), this.status === STATUS.DOWNLOAD ? a.download = this : a.download === this && (a.download = !1), 
                    this.tag.removeClass("status-" + STATUS_NAME[i]), this.tag.addClass("status-" + STATUS_NAME[this.status]), 
                    null != this.dltag ? (this.dltag.removeClass("status-" + STATUS_NAME[i]), this.dltag.addClass("status-" + STATUS_NAME[this.status])) : void 0;
                }
            }), Object.defineProperty(this, "quality", {
                get: function() {
                    return t.quality;
                },
                set: function(e) {
                    var s, r, i, a;
                    if (r = "", null != e) for (i = 0, a = e.length; a > i; i++) if (s = e[i], null != s) {
                        if (s = s.toLowerCase(), "" !== r && r !== s) {
                            r = "multi";
                            break;
                        }
                        r = s;
                    }
                    return $(".quality", this.tag).attr("class", "quality quality-" + r), t.quality = e;
                }
            }), Object.defineProperty(this, "added_time", {
                get: function() {
                    return t.added_time;
                },
                set: function(e) {
                    return $(".time", this.tag).text(new Date(1e3 * e).toFormat("yyyy-MM-dd")), null != this.dltag && $(".time", this.dltag).text(new Date(1e3 * e).toFormat("yyyy-MM-dd")), 
                    t.added_time = e;
                }
            }), Object.defineProperty(this, "thumb", {
                get: function() {
                    return t.thumb;
                },
                set: function(e) {
                    var s;
                    if (e !== this.thumb) return null != (s = r.get(this.playlist)) && (s.thumb = e), 
                    $(".thumb .img", this.tag).empty().append($("<img onerror=\"this.src='data:image/gif;base64,R0lGODlhAwADAIAAAAAAAP///yH5BAEHAAEALAAAAAADAAMAAAIDjH8FADs='\" />").attr("src", e)), 
                    null != this.dltag && $(".thumb .img", this.dltag).empty().append($("<img onerror=\"this.src='data:image/gif;base64,R0lGODlhAwADAIAAAAAAAP///yH5BAEHAAEALAAAAAADAAMAAAIDjH8FADs='\" />").attr("src", e)), 
                    t.thumb = e;
                }
            }), Object.defineProperty(this, "size", {
                get: function() {
                    return t.size;
                },
                set: function(e) {
                    if (t.size = parseInt(e) || 0, 1 > this.size) {
                        if ($(".est-size, dl-size", this.tag).empty(), this.dltag) return $(".est-size, dl-size", this.dltag).empty();
                    } else if ($(".est-size", this.tag).html("&nbsp;/&nbsp;" + $.filesize(this.size)), 
                    this.dltag) return $(".est-size", this.dltag).html("&nbsp;/&nbsp;" + $.filesize(this.size));
                }
            }), Object.defineProperty(this, "dl_size", {
                get: function() {
                    return t.dl_size;
                },
                set: function(e) {
                    return t.dl_size = parseInt(e) || 0, $(".dl-size", this.tag).text($.filesize(this.dl_size)), 
                    this.dltag && $(".dl-size", this.dltag).text($.filesize(this.dl_size)), $(".bar", this.tag).width(100 * (this.dl_size / this.size) + "%"), 
                    this.dltag ? $(".bar", this.dltag).width(100 * (this.dl_size / this.size) + "%") : void 0;
                }
            }), Object.defineProperty(this, "sub_task", {
                get: function() {
                    return t.sub_task || 0;
                },
                set: function(e) {
                    return t.sub_task = parseInt(e) || 0, this.sub_task > 0 && ($(this.tag).addClass("has-sub"), 
                    $(".total-sub", this.tag).html("&nbsp;/&nbsp;" + this.sub_task), this.dltag && $(".total-sub", this.dltag).html("&nbsp;/&nbsp;" + this.sub_task), 
                    $(".bar", this.tag).width(100 * (this.sub_task_ok / this.sub_task) + "%"), this.dltag) ? $(".bar", this.dltag).width(100 * (this.sub_task_ok / this.sub_task) + "%") : void 0;
                }
            }), Object.defineProperty(this, "sub_task_ok", {
                get: function() {
                    return t.sub_task_ok || 0;
                },
                set: function(e) {
                    return t.sub_task_ok = parseInt(e) || 0, $(".ok-sub", this.tag).text(this.sub_task_ok), 
                    this.dltag && $(".ok-sub", this.dltag).text(this.sub_task_ok), this.sub_task > 0 && ($(".bar", this.tag).width(100 * (this.sub_task_ok / this.sub_task) + "%"), 
                    this.dltag) ? $(".bar", this.dltag).width(100 * (this.sub_task_ok / this.sub_task) + "%") : void 0;
                }
            }), void 0);
        }
        return t.prototype.dltag = null, t.prototype.del = function() {
            return $(this.tag).fadeOut(500, function() {
                return $(this).remove();
            }), this.dltag && $(this.dltag).fadeOut(500, function() {
                return $(this).remove();
            }), delete a[this.tid], r.get(this.playlist).del(this);
        }, t;
    }(), a = [], n = {
        index: 0,
        download: !1,
        group: null,
        auto_review: null
    }, Object.defineProperty(a, "download", {
        get: function() {
            return n.download;
        },
        set: function(t) {
            var e, i;
            return i = this.download, i !== t ? (i !== !1 && (i.status === STATUS.DOWNLOAD && (i.time = new Date().getTime() / 1e3, 
            i.status = STATUS.COMPLETE), null != i.dltag && (i.dltag.remove(), i.dltag = null), 
            e = r.get(i.playlist), null != e.dltag && (e.dltag.remove(), e.dltag = null)), t && (t.dltag || (t.dltag = t.tag.clone()), 
            $(".item", s.task.download).is(t.dltag) || s.task.download.append(t.dltag), e = r.get(t.playlist), 
            null == e.dltag && (e.dltag = e.tag.clone()), $(".item", s.group.download).is(e.dltag) || s.group.download.append(e.dltag)), 
            n.download = t) : void 0;
        }
    }), a.push = function(t) {
        return $(t).each(function() {
            var t, s;
            return s = new e(this), a[s.tid] = s, t = r.get(s.playlist), t || (t = r.push({
                name: s.playlist,
                owner: s.owner,
                thumb: s.thumb,
                src: s.src_type
            })), t.push(s);
        });
    }, a.reset = function() {
        for (var t; this.length > 0; ) this.pop();
        return t = !1, r.reset(), this.toggleGroup(), $(".item", s.task.download).remove(), 
        this;
    }, a.toggleGroup = function(t) {
        var e;
        return e = null, n.group = null != t ? t : null, null != n.auto_review && (clearInterval(n.auto_review), 
        delete n.auto_review), $(".item", s.task.list).remove(), n.index = 0, n.auto_review = setInterval(function() {
            return r.draw(), a.draw();
        }, 300);
    }, a.draw = function() {
        var t, e;
        if (!(null != n.group && n.index < n.group.length)) return this;
        if (e = s.task.cursor.offset().top - $(window).scrollTop(), 1.5 * $(window).height() > e) {
            for (t = []; ;) if (t.push(n.group[n.index].tag), n.index++, !(n.index % 5 > 0 && n.index < n.group.length)) break;
            return s.task.cursor.before(t);
        }
    }, a.setListen = function(t, e) {
        return i[t] = e;
    }, $(function() {
        var e, n;
        return e = $("#group"), s.group = {
            download: $(".wrapper-download .download", e),
            list: $(".wrapper-list", e),
            sample: $(".item", e).detach(),
            cursor: $(".wrapper-list .none", e),
            filter: $(".wrapper-filter .filter", e)
        }, n = $(".task"), s.task = {
            download: $(".wrapper-download .download", n),
            list: $(".wrapper-list", n),
            sample: $(".item", n).detach(),
            cursor: $(".wrapper-list .none", n),
            filter: $(".wrapper-filter .filter", n)
        }, a.reset(), $(".item", e).live("click", function() {
            var t;
            return t = r.get($(this).attr("key")), _gaq.push([ "_trackEvent", "Group", "See", t.name ]), 
            a.toggleGroup(t);
        }), $(".cancel", e).live("click", function() {
            var e, s, r, a;
            return r = $(this).parents(".item:first"), e = new t(r), _gaq.push([ "_trackEvent", "Group", "Cancel", e.name ]), 
            s = [], $(e).each(function() {
                switch (this.status) {
                  case STATUS.CANCEL:
                  case STATUS.COMPLETE:
                    break;

                  default:
                    return this.status = STATUS.CANCEL, this.time = new Date().getTime() / 1e3, s.push(this.tid);
                }
            }), "function" == typeof i[a = TASK.GROUP_CANCEL] ? i[a](s) : void 0;
        }), $(".reload", e).live("click", function() {
            var e, s, r, a;
            return r = $(this).parents(".item:first"), e = new t(r), _gaq.push([ "_trackEvent", "Group", "Reload", e.name ]), 
            s = [], $(e).each(function() {
                switch (this.status) {
                  case STATUS.RELOAD:
                  case STATUS.WAIT:
                    break;

                  default:
                    return this.dl_size = 0, this.sub_task_ok = 0, this.status = STATUS.RELOAD, this.time = new Date().getTime() / 1e3, 
                    s.push(this.tid);
                }
            }), "function" == typeof i[a = TASK.GROUP_RELOAD] ? i[a](s) : void 0;
        }), $("select", s.group.filter).on("change", function() {
            var t, e, r, i, a, n, o, l, u;
            for (t = $(this).parent().attr("id"), r = RegExp("^" + t + "-.+"), i = $("option:selected", this), 
            n = i.val(), a = [], $(this).prev().text(i.text()), u = $(s.group.list).attr("class").split(" "), 
            o = 0, l = u.length; l > o; o++) e = u[o], r.exec(e) && a.push(e);
            return a.length > 0 && $(s.group.list).removeClass(a.join(" ")), i.is(":first-child") ? void 0 : $(s.group.list).addClass(t + "-" + n);
        }).change(), $(".cancel", n).live("click", function() {
            var t, e, s;
            return e = $(this).parents(".item:first"), t = e.attr("tid"), _gaq.push([ "_trackEvent", "Task", "Cancel", a[t].name ]), 
            a[t] && (a[t].status = STATUS.CANCEL, a[t].time = new Date().getTime() / 1e3), "function" == typeof i[s = TASK.TASK_CANCEL] ? i[s](t) : void 0;
        }), $(".reload", n).live("click", function() {
            var t, e, s;
            return e = $(this).parents(".item:first"), t = e.attr("tid"), _gaq.push([ "_trackEvent", "Task", "Reload", a[t].name ]), 
            a[t] && (a[t].dl_size = 0, a[t].sub_task_ok = 0, a[t].status = STATUS.RELOAD, a[t].time = new Date().getTime() / 1e3), 
            "function" == typeof i[s = TASK.TASK_RELOAD] ? i[s](t) : void 0;
        }), $(s.task.filter).delegate("li", "click", function() {
            var t, e, r, i, a, n;
            for (e = RegExp("^filter-status-.+"), r = [], n = $(s.task.list).attr("class").split(" "), 
            i = 0, a = n.length; a > i; i++) t = n[i], e.exec(t) && r.push(t);
            return r.length > 0 && $(s.task.list).removeClass(r.join(" ")), $(s.task.list).addClass("filter-status-" + $(this).attr("for")), 
            $(this).addClass("active"), $(this).siblings().removeClass("active");
        });
    }), a;
}();