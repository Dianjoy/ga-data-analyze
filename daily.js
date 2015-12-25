/**
 * 分析GA里获取的广告数据分析的访问记录
 * 拆分为当天（昨天），整月，当月，不分类几种
 *
 * Created by 路佳 on 2015/12/24.
 */
'use strict';

var fs = require('fs')
  , url = require('url')
  , _ = require('underscore')
  , moment = require('moment')
  , stream = fs.createReadStream('daily.csv', 'utf8')
  , lines = []
  , line = ''
  , result = {
    today: 0,
    month: 0,
    thisMonth: 0,
    other: 0
  };

stream.on('data', function (data) {
  if (data.indexOf('\n') === -1) {
    line += data;
    return;
  }

  let parts = data.split('\n');
  line += parts.shift();
  lines.push(line);
  line = parts.pop() || '';
  if (parts.length) {
    lines = lines.concat(parts);
  }
});

stream.on('end', function () {
  var total = 0
    , others = [];
  _.each(lines, function (line) {
    let arr = line.split(',')
      , query = url.parse(arr.shift(), true).query
      , number = parseInt(arr.shift().replace(',', ''));
    total += number;
    if (query.start === query.end) {
      result.today += number;
      return;
    }

    let start = new moment(query.start, 'YYYY-MM-DD')
      , end = new moment(query.end, 'YYYY-MM-DD');
    if (start.isSame(start.clone().startOf('month'), 'day') && end.isSame(end.clone().endOf('month'), 'day')) {
      result.month += number;
      return;
    }

    if (start.isSame(start.clone().startOf('month'), 'day') && end.isSame(start, 'month')) {
      result.thisMonth += number;
      return;
    }

    result.other += number;
    others.push({start: query.start, end: query.end, number: number});
  });

  let percent = _.map(result, function (value) {
    return (value / total * 100).toFixed(2) + '%';
  });
  console.log(result, percent, others);
});