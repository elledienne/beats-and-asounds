var request = require('request');

module.exports.findConcerts = function(callback) {
  var songKickOptions = {
    url: 'http://api.songkick.com/api/3.0/metro_areas/{metro_area_id}/calendar.json?apikey={your_api_key}',
  }
  request.get(songKickOptions, function(error, response, body) {
    var realResponse = body.results;
    //move up filtering once request is working
  });


  var dummyResponse = {
    "event": [{
      "id": 25105504,
      "type": "Concert",
      "uri": "http://www.songkick.com/concerts/25105504-kendrick-lamar-at-fox-theater",
      "displayName": "Kendrick Lamar at Fox Theater (November 10, 2015)",
      "start": {
        "time": "20:00:00",
        "date": "2015-11-10",
        "datetime": "2015-11-18T20:00:00-0800"
      },
      "performance": [{
        "artist": {
          "uri": "http://www.songkick.com/artists/3277856-kendrick-lamar",
          "displayName": "Kendrick Lamar",
          "id": 29835,
          "identifier": []
        },
        "displayName": "Kendrick Lamar",
        "billingIndex": 1,
        "id": 21579303,
        "billing": "headline"
      }],
      "location": {
        "city": "San Francisco, CA, US",
        "lng": -122.4332937,
        "lat": 37.7842398
      },
      "venue": {
        "id": 6239,
        "displayName": "Fox Theater",
        "uri": "http://www.songkick.com/venues/953251-fox-theater",
        "lng": -122.4332937,
        "lat": 37.7842398,
        "metroArea": {
          "uri": "http://www.songkick.com/metro_areas/26330-us-sf-bay-area?utm_source=PARTNER_ID&utm_medium=partner",
          "displayName": "SF Bay Area",
          "country": {
            "displayName": "US"
          },
          "id": 26330,
          "state": {
            "displayName": "CA"
          }
        }
      },
      "status": "ok",
      "popularity": 0.012763
    }, {
      "id": 25317179,
      "type": "Concert",
      "uri": "http://www.songkick.com/concerts/25317179-ellie-goulding-at-sap-center",
      "displayName": "Ellie Goulding at SAP Center (April 6, 2016)",
      "start": {
        "time": "20:00:00",
        "date": "2016-04-06",
        "datetime": "2015-04-06T20:00:00-0800"
      },
      "performance": [{
        "artist": {
          "uri": "http://www.songkick.com/artists/2332047-ellie-goulding",
          "displayName": "Ellie Goulding",
          "id": 29835,
          "identifier": []
        },
        "displayName": "Ellie Goulding",
        "billingIndex": 1,
        "id": 21579303,
        "billing": "headline"
      }],
      "location": {
        "city": "San Francisco, CA, US",
        "lng": -122.4332937,
        "lat": 37.7842398
      },
      "venue": {
        "id": 6239,
        "displayName": "SAP Center",
        "uri": "http://www.songkick.com/venues/2505-sap-center",
        "lng": -122.4332937,
        "lat": 37.7842398,
        "metroArea": {
          "uri": "http://www.songkick.com/metro_areas/26330-us-sf-bay-area?utm_source=PARTNER_ID&utm_medium=partner",
          "displayName": "SF Bay Area",
          "country": {
            "displayName": "US"
          },
          "id": 26330,
          "state": {
            "displayName": "CA"
          }
        }
      },
      "status": "ok",
      "popularity": 0.012763
    }, {
      "id": 25261749,
      "type": "Concert",
      "uri": "http://www.songkick.com/concerts/25105504-kendrick-lamar-at-fox-theater",
      "displayName": "Jess Glynne at Mezzanine (February 8, 2016)",
      "start": {
        "time": "20:00:00",
        "date": "2016-02-08",
        "datetime": "2015-11-18T20:00:00-0800"
      },
      "performance": [{
        "artist": {
          "uri": "http://www.songkick.com/artists/4130211-jess-glynne",
          "displayName": "Jess Glynne",
          "id": 29835,
          "identifier": []
        },
        "displayName": "Jess Glynne",
        "billingIndex": 1,
        "id": 21579303,
        "billing": "headline"
      }],
      "location": {
        "city": "San Francisco, CA, US",
        "lng": -122.4332937,
        "lat": 37.7842398
      },
      "venue": {
        "id": 6239,
        "displayName": "Mezzanine",
        "uri": "http://www.songkick.com/venues/329-mezzanine",
        "lng": -122.4332937,
        "lat": 37.7842398,
        "metroArea": {
          "uri": "http://www.songkick.com/metro_areas/26330-us-sf-bay-area?utm_source=PARTNER_ID&utm_medium=partner",
          "displayName": "SF Bay Area",
          "country": {
            "displayName": "US"
          },
          "id": 26330,
          "state": {
            "displayName": "CA"
          }
        }
      },
      "status": "ok",
      "popularity": 0.012763
    }, {
      "id": 25261749,
      "type": "Concert",
      "uri": "https://www.songkick.com/concerts/24120339-1975-at-fox-theater",
      "displayName": "1975 at the Fox (December 17, 2015)",
      "start": {
        "time": "20:00:00",
        "date": "2015-12-17",
        "datetime": "2015-11-18T20:00:00-0800"
      },
      "performance": [{
        "artist": {
          "uri": "https://www.songkick.com/artists/66370-1975",
          "displayName": "The 1975",
          "id": 29835,
          "identifier": []
        },
        "displayName": "The 1975",
        "billingIndex": 1,
        "id": 21579303,
        "billing": "headline"
      }],
      "location": {
        "city": "San Francisco, CA, US",
        "lng": -122.4332937,
        "lat": 37.7842398
      },
      "venue": {
        "id": 6239,
        "displayName": "Fox Theater",
        "uri": "https://www.songkick.com/venues/953251-fox-theater",
        "lng": -122.4332937,
        "lat": 37.7842398,
        "metroArea": {
          "uri": "http://www.songkick.com/metro_areas/26330-us-sf-bay-area?utm_source=PARTNER_ID&utm_medium=partner",
          "displayName": "SF Bay Area",
          "country": {
            "displayName": "US"
          },
          "id": 26330,
          "state": {
            "displayName": "CA"
          }
        }
      },
      "status": "ok",
      "popularity": 0.012763
    }, {
      "id": 25261749,
      "type": "Concert",
      "uri": "https://www.songkick.com/concerts/25260889-weezer-at-oracle-arena",
      "displayName": "Weezer at Oracle Arena (December 11, 2015)",
      "start": {
        "time": "20:00:00",
        "date": "2015-12-11",
        "datetime": "2015-11-18T20:00:00-0800"
      },
      "performance": [{
        "artist": {
          "uri": "https://www.songkick.com/artists/544909-weezer",
          "displayName": "Weezer",
          "id": 29835,
          "identifier": []
        },
        "displayName": "Weezer",
        "billingIndex": 1,
        "id": 21579303,
        "billing": "headline"
      }, {
        "artist": {
          "uri": "https://www.songkick.com/artists/5933069-chvrches",
          "displayName": "CHVRCHES",
          "id": 29835,
          "identifier": []
        },
        "displayName": "CHVRCHES",
        "billingIndex": 1,
        "id": 21579303,
        "billing": "support"
      }],
      "location": {
        "city": "San Francisco, CA, US",
        "lng": -122.4332937,
        "lat": 37.7842398
      },
      "venue": {
        "id": 6239,
        "displayName": "Oracle Arena",
        "uri": "https://www.songkick.com/venues/615-oracle-arena",
        "lng": -122.4332937,
        "lat": 37.7842398,
        "metroArea": {
          "uri": "http://www.songkick.com/metro_areas/26330-us-sf-bay-area?utm_source=PARTNER_ID&utm_medium=partner",
          "displayName": "SF Bay Area",
          "country": {
            "displayName": "US"
          },
          "id": 26330,
          "state": {
            "displayName": "CA"
          }
        }
      },
      "status": "ok",
      "popularity": 0.012763
    }]
  };

  callback(dummyResponse)
};
