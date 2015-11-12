var querystring = require('querystring');
var Promise = require('bluebird');
var request = require('request');

var util = require('./utils.js');
var supersecret = require('./config.js');

var client_id = supersecret.client_id;
var client_secret = supersecret.client_secret;
var redirect_uri = 'http://localhost:8888/callback';

module.exports.authorize = function(req, res) {
  var stateKey = 'spotify_auth_state';
  var state = util.generateRandomString(16);
  res.cookie(stateKey, state);

  var scope = 'user-read-private user-read-email user-follow-read';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
};

module.exports.getToken = function(code) {
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

  return new Promise(function(resolve, reject) {
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token;
        var refresh_token = body.refresh_token;
        resolve(access_token, refresh_token);
      } else {
        reject();
      }
    });
  });
};

module.exports.refreshToken = function(req, res) {
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
}

module.exports.findUser = function(token) {
  var authOptions = {
    url: 'https://api.spotify.com/v1/me',
    headers: {
      'Authorization': 'Bearer ' + token
    },
    json: true
  };
  return util.buildPromise(authOptions).then(function(body) {
    return body.id;
  });
};

module.exports.getMyArtists = function(token) {
  var followOptions = {
    url: 'https://api.spotify.com/v1/me/following?type=artist&limit=50',
    headers: {
      'Authorization': 'Bearer ' + token
    },
    json: true
  }
  return util.buildPromise(followOptions).then(function(body) {
    var artistsArr = body.artists.items;
    // TO DO: what if they have more than 50 artists?
    var artists = {};
    artistsArr.forEach(function(artist) {
      artists[artist.name] = {
        info: artist
      };
    })
    return artists;
  });
}

module.exports.getPlaylists = function(token, userID) {
  var playlistOptions = {
    url: 'https://api.spotify.com/v1/users/' + userID + '/playlists',
    headers: {
      'Authorization': 'Bearer ' + token
    },
    json: true
  };

  return util.buildPromise(playlistOptions).then(function(body) {
    return body.items
  });
};

module.exports.getTracks = function(token, userID, playlists) {
  var playlistPromises = [];
  playlists.forEach(function(playlist) {
    //if playlist is hosted on iTunes and not Spotify, it won't have associated images
    if (playlist.images.length) {
      var playlistID = playlist.id;
      var trackOptions = {
        url: 'https://api.spotify.com/v1/users/' + userID + '/playlists/' + playlistID + '/tracks',
        headers: {
          'Authorization': 'Bearer ' + token
        },
        json: true
      };
      playlistPromises.push(util.buildPromise(trackOptions));
    }
  });
  return Promise.all(playlistPromises);
};

module.exports.getArtists = function(tracks) {
  var artistPromises = [];
  var artists = {};
  tracks.forEach(function(trackListings) {
    if (trackListings.items) {
      trackListings.items.forEach(function(item) {
        item.track.artists.forEach(function(artist) {
          if (!artists[artist.name]) {
            artists[artist.name] = {
              myCount: 1
            };
            var artistOptions = {
              url: 'https://api.spotify.com/v1/artists/' + artist.id,
              json: true
            };
            artistPromises.push(util.buildPromise(artistOptions));
          } else {
            artists[artist.name].myCount++;
          }
        });
      });
    }
  });
  return Promise.all(artistPromises)
    .then(function(artistObjs) {
      artistObjs.forEach(function(artistObj) {
        artists[artistObj.name].info = artistObj;
      });
      return artists;
    });

};
