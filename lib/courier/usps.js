'use strict'

var request = require('request')
var cheerio = require('cheerio')
//var moment = require('moment')
var format = require('date-fns/format')
var parse = require('date-fns/parse')
var formatISO = require('date-fns/formatISO')

var tracker = require('../')

var trackingInfo = function (number) {
  return {
    method: 'GET',
    url: 'https://tools.usps.com/go/TrackConfirmAction.action?tLabels=' + number
  }
}

var parser = {
  trace: function (body) {
    var $ = cheerio.load(body)
    var courier = {
      code: tracker.COURIER.USPS.CODE,
      name: tracker.COURIER.USPS.NAME
    }
    var result = {
      courier: courier,
      number: $('input[name=label]').val(),
      status: tracker.STATUS.PENDING,
      receivedBy:null
    }
    var toText = function (txt) {
      if (!txt) {
        return ''
      }
      return $(txt.indexOf('<span>') !== -1 ? txt : '<span>' + txt + '</span>').text().trim()
    }

    var checkpoints = []

    var $history = $('#trackingHistory_1').find('.panel-actions-content')
    $('.mobileOnly').remove()

    // html -> txt
    var rawTxt = $history.html()
    if (!rawTxt) {
      return false
    }
    rawTxt = rawTxt.replace(/\s+/g, ' ')
    // txt -> history list
    var rawList = rawTxt.split('<hr>')
    for (var i = 0; i < rawList.length; i++) {
      var list = rawList[i].split('<br>')
      if (list.length <= 3) {
        continue
      }
      var time = $(list[0]).text().trim()
      var statusMessage = toText(list[1])
      var location = toText(list[2])
      var message = [statusMessage]

      if ((list[3] || '').trim().length > 0) {
        message.push(toText(list[3]))
      }
      var ts = parse(time, 'MMMM dd, yyyy, hh:mm a', new Date());
      var checkpoint = {
        courier: courier,
        location: location,
        message: message.join(' - '),
        status: tracker.STATUS.IN_TRANSIT,
        // November 17, 2017, 3:08 pm
        //time: moment(time, 'MMMM DD, YYYY, hh:mm a').format('YYYY-MM-DDTHH:mm')
        //time: format(ts,'yyyy-MM-ddTHH:mm')
        time: formatISO(ts)
      }

      checkpoint.message.indexOf('Shipping Label Created') !== -1 && (checkpoint.status = tracker.STATUS.INFO_RECEIVED)
      checkpoint.message.indexOf('Delivered') !== -1 && (checkpoint.status = tracker.STATUS.DELIVERED)

      checkpoints.push(checkpoint)
    }

    result.checkpoints = checkpoints
    var normStatus = tracker.normalizeStatus(result.checkpoints);
  
  result.status = normStatus.status;
  result.latestTimestamp = normStatus.latestTimestamp;


    return result
  }
}

module.exports = function (opts) {
  return {
    trackingInfo: trackingInfo,
    trace: function (number, cb) {
      var tracking = trackingInfo(number)
      request.get({
        url: tracking.url
      }, function (err, res, body) {
        if (err) {
          return cb(err)
        }

        try {
          var result = parser.trace(body)
          cb(result ? null : tracker.error(tracker.ERROR.INVALID_NUMBER), result)
        } catch (e) {
          cb(e.message)
        }
      })
    }
  }
}
