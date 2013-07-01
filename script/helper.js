$.filesize = function(t, e) {
    var s, r, i, a, n, o;
    for (null == e && (e = 0), a = [ "bytes", "KB", "MB", "GB", "TB" ], s = n = 0, o = a.length; o > n; s = ++n) if (r = a[s], 
    i = t / Math.pow(1024, s), 1024 > i) return 0 === s ? 0 === t ? "0KB" : "> 1KB" : i.toFixed(e) + a[s];
    return (t / Math.pow(1024, a.length - 1)).toFixed(e) + a[a.length - 1];
};