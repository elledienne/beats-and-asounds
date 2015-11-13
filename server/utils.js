var session = require('express-session');
var Promise = require('bluebird');
var request = require('request');

var query = require('./db/dbHelper.js');


var db = require('./db/dummyDataHandler_laura.js');



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



module.exports.findMyConcerts = function(artists, concerts, callback) {
  query.insertHandler(concerts);
  console.log('How many times?')
  var myShows = [];
  concerts.event.forEach(function(show) {
    show.performance.forEach(function(performer) {
      if (artists[performer.artist.displayName]) {
        artists[performer.artist.displayName].show = show;
        myShows.push(artists[performer.artist.displayName]);
      }
    });
  });
  return myShows;
};
