var express = require('express');
var request = require('request');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var Promise = require('bluebird');
var session = require('express-session');
var supersecret = require('./config.js')

var client_id = supersecret.client_id;
var client_secret = supersecret.client_secret;
var redirect_uri = 'http://localhost:8888/callback';

var google_client_id = supersecret.google_client_id;
var google_client_secret = supersecret.google_client_secret;

var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(session({
  secret: "super secret string"
}));

app.use(express.static(__dirname + '/public'))
  .use(cookieParser());

app.get('/login', function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
          refresh_token = body.refresh_token;

        req.session.regenerate(function() {
          req.session.accessToken = body.access_token;
          req.session.refreshToken = body.refresh_token;
          res.redirect('/')
        })
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/myconcerts', function(req, res) {

  if (req.session.accessToken === undefined) {
    res.end('go to login');
  } else {

    var authOptions = {
      url: 'https://api.spotify.com/v1/me',
      headers: {
        'Authorization': 'Bearer ' + req.session.accessToken
      },
      json: true
    };

    request.get(authOptions, function(error, response, body) {
      var userID = body.id

      var playlistOptions = {
        url: 'https://api.spotify.com/v1/users/' + userID + '/playlists',
        headers: {
          'Authorization': 'Bearer ' + req.session.accessToken
        },
        json: true
      };

      request.get(playlistOptions, function(error, response, body) {

        var playlist = body.items;
        var playlistPromises = [];
        playlist.forEach(function(playlist) {
          //if playlist is hosted on iTunes and not Spotify, it won't have associated images
          if (playlist.images.length) {
            var playlistID = playlist.id;
            var trackOptions = {
              url: 'https://api.spotify.com/v1/users/' + userID + '/playlists/' + playlistID + '/tracks',
              headers: {
                'Authorization': 'Bearer ' + req.session.accessToken
              },
              json: true
            };
            playlistPromises.push(
              new Promise(function(resolve, reject) {
                request.get(trackOptions, function(error, response, body) {
                  if (error) {
                    reject(error);
                  } else {
                    resolve(body.items);
                  }
                })
              })
            );
          }
        });

        Promise.all(playlistPromises)
          .then(function(playlists) {
            var artistPromises = [];
            var artists = {};
            playlists.forEach(function(trackListings) {
              trackListings.forEach(function(item) {
                item.track.artists.forEach(function(artist) {
                  if (!artists[artist.name]) {
                    artists[artist.name] = {
                      myCount: 1,
                    };
                    var artistOptions = {
                      url: 'https://api.spotify.com/v1/artists/' + artist.id,
                      json: true
                    };

                    artistPromises.push(new Promise(function(resolve, reject) {
                      request.get(artistOptions, function(error, response, body) {
                        if (error) {
                          reject(error);
                        } else {
                          resolve(body);
                        }
                      });
                    }));
                  } else {
                    artists[artist.name].myCount++;
                  }
                })
              })
            });

            Promise.all(artistPromises)
              .then(function(artistObjs) {
                artistObjs.forEach(function(artistObj) {
                  artists[artistObj.name].info = artistObj;
                })

                //SONGKICK REQUESTS HERE
                var songKickOptions = {
                  url: 'http://api.songkick.com/api/3.0/metro_areas/{metro_area_id}/calendar.json?apikey={your_api_key}',
                }
                request.get(songKickOptions, function(error, response, body) {
                  var realResponse = body.results;
                  //move up filtering once request is working
                })


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
                var concerts = [];
                dummyResponse.event.forEach(function(show) {
                  show.performance.forEach(function(performer) {
                    if (artists[performer.artist.displayName]) {
                      artists[performer.artist.displayName].show = show;
                      concerts.push(artists[performer.artist.displayName]);
                    }
                  });
                });
                res.json(concerts);
              })

          })

      })
    });
  }

})

app.get('/refresh_token', function(req, res) {

  var refresh_token = req.session.refreshToken;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      req.session.accessToken = body.access_token;
      res.redirect('/login');
    }
  });
});

console.log('Listening on 8888');
app.listen(8888);
