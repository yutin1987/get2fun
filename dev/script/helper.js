$.filesize = function(size, pos) {
  var i, item, temp, unit, _i, _len;

  if (pos == null) {
    pos = 0;
  }
  unit = ['bytes', 'KB', 'MB', 'GB', 'TB'];
  for (i = _i = 0, _len = unit.length; _i < _len; i = ++_i) {
    item = unit[i];
    temp = size / Math.pow(1024, i);
    if (temp < 1024) {
      if (i === 0) {
        if (size === 0) {
          return '0KB';
        } else {
          return '> 1KB';
        }
      } else {
        return temp.toFixed(pos) + unit[i];
      }
    }
  }
  return (size / Math.pow(1024, unit.length - 1)).toFixed(pos) + unit[unit.length - 1];
};
