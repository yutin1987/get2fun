$.filesize = (size, pos = 0) ->
  unit = ['bytes', 'KB', 'MB', 'GB', 'TB'];

  for item, i in unit
    temp = size / Math.pow(1024, i)
    if temp < 1024
      if i is 0
        return if size is 0 then '0KB' else '> 1KB'
      else
        return temp.toFixed(pos) + unit[i];

  return (size / Math.pow(1024, unit.length - 1)).toFixed(pos) + unit[unit.length - 1];