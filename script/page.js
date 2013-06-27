$.filesize = function(t, e) {
    var n, i, l, o, r, B;
    for (null == e && (e = 0), o = [ "bytes", "KB", "MB", "GB", "TB" ], n = r = 0, B = o.length; B > r; n = ++r) if (i = o[n], 
    l = t / Math.pow(1024, n), 1024 > l) return 0 === n ? 0 === t ? "0KB" : "> 1KB" : l.toFixed(e) + o[n];
    return (t / Math.pow(1024, o.length - 1)).toFixed(e) + o[o.length - 1];
}, $.filesize = function(t, e) {
    var n, i, l, o, r, B;
    for (null == e && (e = 0), o = [ "bytes", "KB", "MB", "GB", "TB" ], n = r = 0, B = o.length; B > r; n = ++r) if (i = o[n], 
    l = t / Math.pow(1024, n), 1024 > l) return 0 === n ? 0 === t ? "0KB" : "> 1KB" : l.toFixed(e) + o[n];
    return (t / Math.pow(1024, o.length - 1)).toFixed(e) + o[o.length - 1];
};