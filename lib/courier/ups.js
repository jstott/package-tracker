'use strict'

var request = require('request')
var tracker = require('../index')
//var moment = require('moment')
var format = require('date-fns/format')
var parse = require('date-fns/parse')
var formatISO = require('date-fns/formatISO')

var trackingInfo = function (number) {
  return {
    method: 'POST',
    url: 'https://wwwapps.ups.com/track/api/Track/GetStatus?loc=en_KR',
    body: JSON.stringify({
      Locale: 'en_KR',
      Requester: 'UPSHome',
      TrackingNumber: [number]
    }),
    headers: {
      'content-type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0'
    }
  }
}
var mapActivityScanToStatus = function(activity) {
  activity = activity || '';
  activity = activity.trim();
  activity = activity.toLowerCase();

  
  switch(activity) {
    case "delivered":
      return tracker.STATUS.DELIVERED;
    case "pickup":
    case "billing information received":
      return tracker.STATUS.INFO_RECEIVED;
    case "exception":
      return tracker.STATUS.EXCEPTION;
    case "drop-off":
      return tracker.STATUS.DROPOFF;
    case "out for delivery":
    case "out for delivery today":
      return tracker.STATUS.OUTFORDELIVERY;
    default:
      return tracker.STATUS.IN_TRANSIT;
  }
}
module.exports = function (opts) {
  return {
    trackingInfo: trackingInfo,
    trace: function (number, cb) {
      var tracking = trackingInfo(number)
      request(tracking, function (err, res, body) {
        var response = JSON.parse(body)
        //console.log(body);
        if (response.statusCode !== '200') {
          return cb(response.statusText)
        }
        var currentTrackNumberStatus = response.trackDetails[0]
        if (err || currentTrackNumberStatus.errorCode !== null) {
          return cb(err || currentTrackNumberStatus.errorText)
        }

        var courier = {
          code: tracker.COURIER.UPS.CODE,
          name: tracker.COURIER.UPS.NAME
        }
        var result = {
          courier: courier,
          status: currentTrackNumberStatus.progressBarType,
          number: currentTrackNumberStatus.trackingNumber,
          receivedBy: currentTrackNumberStatus.receivedBy
        }

        var checkpoints = []

        for (var i = 0; i < currentTrackNumberStatus.shipmentProgressActivities.length; i++) {
          var current = currentTrackNumberStatus.shipmentProgressActivities[i]
          if (!current.date) {
            continue
          }
          var ts = parse([current.date, current.time].join(' '), 'yyyy/MM/dd HH:mm', new Date());
          var checkpoint = {
            courier: courier,
            location: current.location,
            message: current.activityScan,
            status: mapActivityScanToStatus(current.activityScan),
            //time: moment([current.date, current.time].join(' '), 'YYYY/MM/DD HH:mm').format('YYYY-MM-DDTHH:mm')
            //time: format(ts,'yyyy-MM-ddTHH:mm')
            time: formatISO(ts)
          }

          checkpoints.push(checkpoint)
        }

        result.checkpoints = checkpoints
        var normStatus = tracker.normalizeStatus(result.checkpoints);
  
  result.status = normStatus.status;
  result.latestTimestamp = normStatus.latestTimestamp;


        cb(null, result)
      })
    }
  }
}
