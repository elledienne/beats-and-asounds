var querystring = require('querystring');
var Promise = require('bluebird');
var request = require('request');

var util = require('./utils.js');
var supersecret = require('./config.js');

//client_id and client_secret are stored in config file so they won't appear on GitHub
var client_id = supersecret.client_id;
var client_secret = supersecret.client_secret;
var redirect_uri = 'http://localhost:8888/callback';

module.exports.authorize = function(req, res) {
  var stateKey = 'spotify_auth_state';
  //State is optional but strongly recommended, ensures that incoming connection is the result of an authentication request (since redirect URI can be guessed)
  var state = util.generateRandomString(16);
  res.cookie(stateKey, state);

  //More about Spotify scopes: https://developer.spotify.com/web-api/using-scopes/
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

//Get tokens from access code
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
        var tokens = [access_token, refresh_token];
        //Fun fact that I didn't know and broke everything: you can only resolve a promise with a single value, so you need so resolve with a token array and not separate access_token, refresh_token values
        resolve(tokens);
      } else {
        reject(error);
      }
    });
  });
};

//Refresh expired (or soon-to-be expired) access token
module.exports.refreshToken = function(refresh_token) {
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

  return new Promise(function(resolve, reject) {
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        resolve(body);
      }
    });
  });
}

//Identify user from their token:
//https://developer.spotify.com/web-api/get-current-users-profile/
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

//Identify followed artists from user token
//https://developer.spotify.com/web-api/get-followed-artists/
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
    // TO DO: what if they have more than 50 artists? (limit per page is 50)
    var artists = {};
    artistsArr.forEach(function(artist) {
      //need .toUpperCase() in case of stupid hipster bands with weird capitalization in their name
      artists[artist.name.toUpperCase()] = {
        info: artist
      };
    })
    return artists;
  });
};

//Identify relatd artists from a spotify artist ID
//https://developer.spotify.com/web-api/get-related-artists/
module.exports.getRelatedArtists = function(artistID) {
  var relatedArtistOptions = {
    url: 'https://api.spotify.com/v1/artists/' + artistID + '/related-artists',
    json: true
  };
  return util.buildPromise(relatedArtistOptions).then(function(body) {
    var artists = {};
    body.artists.forEach(function(artist) {
      artists[artist.name.toUpperCase()] = {
        info: artist
      };
    })
    return artists;
  });
};

//Get user's playlists from their userID and token
//https://developer.spotify.com/web-api/get-list-users-playlists/
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

//Get tracks from all a user's playlists
//https://developer.spotify.com/web-api/get-playlists-tracks/
module.exports.getTracks = function(token, userID, playlists) {
  var playlistPromises = [];
  playlists.forEach(function(playlist) {
    //if playlist is hosted on iTunes and not Spotify, it won't have associated images that we use on the front end
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

//Get a artists from an array of tracks
//https://developer.spotify.com/web-api/get-artist/
//The response from getTracks (above) includes a limited artist object, but we need to make a request for the full artist object to get the images used on the front end
//A token isn't needed for this request since we aren't accessing user-specific information
module.exports.getArtists = function(tracks) {
  var artistPromises = [];
  var artists = {};
  tracks.forEach(function(trackListings) {
    if (trackListings.items) {
      trackListings.items.forEach(function(item) {
        item.track.artists.forEach(function(artist) {
          if (!artists[artist.name.toUpperCase()]) {
            artists[artist.name.toUpperCase()] = {
              //myCount keeps track of how many times an artist appears in your playlists
              myCount: 1
            };
            var artistOptions = {
              url: 'https://api.spotify.com/v1/artists/' + artist.id,
              json: true
            };
            artistPromises.push(util.buildPromise(artistOptions));
          } else {
            artists[artist.name.toUpperCase()].myCount++;
          }
        });
      });
    }
  });
  return Promise.all(artistPromises)
    .then(function(artistObjs) {
      artistObjs.forEach(function(artistObj) {
        artists[artistObj.name.toUpperCase()].info = artistObj;
      });
      return artists;
    });

};
