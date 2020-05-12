/* globals before it describe */

'use strict'

var assert = require('assert')

var prepare = require('./fixtures/prepare')
var tracker = require('../')

var courier = tracker.courier(tracker.COURIER.UPS.CODE)

describe(tracker.COURIER.UPS.NAME, function () {
  // var deliveredNum = 'DELIVEREDUPS'
  var exceptionNum = 'EXCEPTIONUPS'

  before(function () {
    // @TODO add nock
    // prepare(courier, deliveredNum)
    prepare(courier, exceptionNum)
  })

  // it('delivered number', function (done) {
  //   courier.trace(deliveredNum, function (err, result) {
  //     assert.equal(err, null)

  //     assert.equal(deliveredNum, result.number)
  //     assert.equal(tracker.COURIER.UPS.CODE, result.courier.code)
  //     assert.equal(tracker.STATUS.DELIVERED, result.status)

  //     done()
  //   })
  // })

  it('exception number', function (done) {
    courier.trace(exceptionNum, function (err, result) {
      assert.equal(err, null)

      assert.equal(exceptionNum, result.number)
      assert.equal(tracker.COURIER.UPS.CODE, result.courier.code)
      //assert.equal(tracker.STATUS.EXCEPTION, result.status)

      done()
    })
  })
})
