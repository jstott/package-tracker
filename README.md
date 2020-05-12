# package-tracker

package-tracker is delivery tracking library for Node.js, originally from https://github.com/egg-/delivery-tracker.  That source has been modified to support a discreet set of couriers [FedEx, UPS, USPS] and includes additional attributes in the return status object (signedBy for example).

Fair warning to anyone thinking of using this project, fork it & then use as you wish.  It will be modified in the very near future resulting in wholesale breaking changes up to and including being removed entirely.
It is a short-term solution for my package tracking needs, and those needs are evolving.


## Courier List

Name |  Link
---- |  ----
FedEx |  https://www.fedex.com/
USPS |  https://www.usps.com/
UPS | https://www.ups.com


## Installation

```sh
$ npm install package-tracker
```

## Usage

```javascript
var tracker = require('package-tracker')
var courier = tracker.courier(tracker.COURIER.UPS.CODE)

courier.trace({trace_number}, function (err, result) {
  console.log(result)
})
```

### Command Line

```sh
$ npm install -g package-tracker
$ package-tracker -h

Usage: index [options] <tracecode>

  Options:

    -h, --help               output usage information
    -c, --courier <courier>  Courier Namespace
    -k, --apikey <apikey>  Courier API key

$ package-tracker -c UPS EBXXXXXXXXXKR
```


## Response

Attribute | Type | Description
---- | ---- | ----
courier | Courier Object | courier information
number | String | tracking number
status | String | delivery status
checkpoints | Array of Checkpoint Object | Array of the checkpoint information.

### Courier Object

Attribute | Type | Description
---- | ---- | ----
code | String | Unique code of courier.
name | String | Courier name

### Checkpoint Object

Attribute | Type | Description
---- | ---- | ----
courier | Courier Object | courier information
location | String | Location info of the checkpoint provided by the courier.
message | String | Checkpoint message
time | String | The date and time of the checkpoint provided by the courier. The values can be:<br>Empty string,<br> YYYY-MM-DD,<br> YYYY-MM-DDTHH:mm:ss <br> YYYY-MM-DDTHH:mm:ss+Timezone


## CODE

### COURIER

`tracker.COURIER.{NAMESPACE}`

NAMESPACE | CODE | NAME
---- | ---- | ----

FEDEX | fedex | FedEx
USPS | usps | USPS
UPS | ups | UPS


### STATUS

`tracker.STATUS.{CODE}`

Code | Value | Description
---- | ---- | ----
INFO_RECEIVED | InfoReceived | The carrier received a request from the shipper and wants to start shipping.
PENDING | Pending | New pending shipment to track or a new shipment without tracking information added.
IN_TRANSIT | InTransit | The carrier has received or received the carrier. Shipment is in progress.
DELIVERED | Delivered | The shipment was successfully delivered.
EXCEPTION | Exception | Custom hold, undeliverable, shipper has shipped or shipped an exception.
FAIL_ATTEMPT | FailAttempt | The courier tried to send but failed, but usually reminds and tries again.

### ERROR

`tracker.STATUS.{CODE}`

Code | Value | Description
---- | ---- | ----
UNKNOWN | -1 | Unknow error
NOT_SUPPORT_SHIPMENT | 20 | shipment does not support.
INVALID_NUMBER | 10 | invalid trace number.
INVALID_NUMBER_LENGTH | 11 | invalid trace number.
INVALID_NUMBER_HEADER | 12 | invalid trace number.
INVALID_NUMBER_COUNTRY | 13 | invalid trace number.

### Sample

```javascript


// FEDEX
{
  "courier": {
    "code": "fedex",
    "name": "FedEx"
  },
  "number": "DELIVEREDNUM",
  "status": "Delivered",
  "checkpoints": [
    {
      "courier": {
        "code": "fedex",
        "name": "FedEx"
      },
      "location": "SOUTH JORDAN, UT",
      "message": "Package delivered by U.S. Postal Service to addressee",
      "status": "Delivered",
      "time": "2016-12-14T13:17:00-07:00"
    },
    // ...
  ]
}

```

## Test

Test with mocha

```bash
$ npm test
```



## Contributing

1. Fork it


## Release History

See the [CHANGELOG.md](CHANGELOG.md)

## License

delivery-tracker is licensed under the [MIT license](https://github.com/jstott/package-tracker/blob/master/LICENSE).
