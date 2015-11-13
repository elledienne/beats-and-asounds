var session = require('express-session');
var Promise = require('bluebird');
var request = require('request');

var query = require('./db/dbHelper.js');

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
    res.end('go to login');
  } else {
    next();
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
