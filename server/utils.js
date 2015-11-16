var session = require('express-session');
var Promise = require('bluebird');
var request = require('request');
var context = require('request-context');

var query = require('./db/dbHelper.js');
var spotify = require('./spotifyInt.js')

module.exports.generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

module.exports.checkState = function(req, res, next) {
  var stateKey = 'spotify_auth_state';
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    next();
  }
};

module.exports.checkToken = function(req, res, next) {
  if (req.cookies.userID === undefined) {
    console.log('redirecting to login because cookie is undefined');
    res.end('go to login');
  } else {
    query.fetchToken(req.cookies.userID).then(function(tokenInfo) {
      if (!tokenInfo.length) {
        console.log('redirecting to login because token is undefined');
        res.end('go to login');
      }
      var currentTime = Date.now() / 60000;
      console.log("token age", currentTime - tokenInfo[0].created_at, "utils.js 43");
      if (currentTime - tokenInfo[0].created_at > 50) {
        console.log("refreshing token utils.js 45");
        return spotify.refreshToken(tokenInfo[0].refresh_token)
          .then(function(body) {
            context.set('request:token', body.access_token);
            return query.updateUser(body.access_token, body.refresh_token, req.cookies.userID);
          })
      } else {
        context.set('request:token', tokenInfo[0].access_token);
      }
    }).then(function() {
      next();
    })
  }
};


module.exports.buildPromise = function(options) {
  return new Promise(function(resolve, reject) {
    request.get(options, function(error, respose, body) {
      if (error) {
        reject(error);
      } else {
        resolve(body);
      }
    })
  });
};



module.exports.assembleResponse = function(artists, concerts) {
  var myShows = [];
  concerts.forEach(function(event) {
    if (event) {
      artists[event.performer_name.toUpperCase()].show = event;
      myShows.push(artists[event.performer_name.toUpperCase()]);
    }
  });
  return myShows;
};
