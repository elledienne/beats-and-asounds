var session = require('express-session');
var Promise = require('bluebird');
var request = require('request');

module.exports.generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

module.exports.generateSession = function(req, access_token, refresh_token, callback) {
  req.session.regenerate(function() {
    req.session.accessToken = access_token;
    req.session.refreshToken = refresh_token;
    callback();
  });
};

module.exports.checkToken = function(req, res, next) {
  if (req.session.accessToken === undefined) {
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
  var myShows = [];
  concerts.event.forEach(function(show) {
    show.performance.forEach(function(performer) {
      if (artists[performer.artist.displayName]) {
        artists[performer.artist.displayName].show = show;
        myShows.push(artists[performer.artist.displayName]);
      }
    });
  });
  callback(myShows);
};
