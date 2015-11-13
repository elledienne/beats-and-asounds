var querystring = require('querystring');

var spotify = require('./spotifyInt.js');
var songkick = require('./songkickInt.js');
var util = require('./utils.js');

var query = require('./db/dbHelper.js');



module.exports.callback = function(req, res) {
  var code = req.query.code;
  spotify.getToken(code)
    .catch(function(error) {
      console.log('OH NO ' + error + 'in callback requestHandler.js');
      res.redirect('/#' +
        querystring.stringify({
          error: 'invalid_token'
        }));
    })
    .then(function(tokens) {
      var access_token = tokens[0];
      var refresh_token = tokens[1];
      return spotify.findUser(access_token)
        .then(function(userID) {
          res.cookie("userID", userID, {
            maxAge: 900000,
            httpOnly: true
          });
          return query.addUserToDatabase(access_token, refresh_token, userID)
            .then(function() {
              res.redirect('/');
            });
        })
    })
    .catch(function(error) {
      console.log('OH NO ' + error + ' in callback, requestHandler.js');
    });
};

module.exports.myConcerts = function(req, res) {
  query.findUserInDatabase(req.cookies.userID)
    .then(function(userData) {

      var userID = userData[0].userID;
      var token = userData[0].access_token;
      var location = req.query.location;

      spotify.getPlaylists(token, userID)
        .then(function(playlists) {
          return spotify.getTracks(token, userID, playlists);
        }).then(function(tracks) {
          return spotify.getArtists(tracks);
        }).then(function(artists) {
          return module.exports.collectConcerts(location, artists);
        }).then(function(myShows) {
          res.json(myShows);
        });
    });
};

module.exports.suggestedConcerts = function(req, res) {
  var location = req.query.location;
  var artistID = req.query.artistID;

  return spotify.getRelatedArtists(artistID)
    .then(function(artists) {
      return module.exports.collectConcerts(location, artists);
    })
};

module.exports.myArtists = function(req, res) {
  query.findUserInDatabase(req.cookies.userID)
    .then(function(userData) {

      var userID = userData[0].userID;
      var token = userData[0].access_token;
      var location = req.query.location;

      spotify.getMyArtists(token)
        .then(function(artists) {
          return module.exports.collectConcerts(location, artists);
        }).then(function(myShows) {
          res.json(myShows);
        })
    })
};

module.exports.collectConcerts = function(location, artists) {
  return songkick.findMyMetroArea(location)
    .then(function(metroID) {
      return query.checkForMetroID(metroID)
        .then(function(metroInfo) {
          if (!metroInfo.length) {
            return songkick.findConcerts(metroID);
          }
        }).then(function() {
          return query.fetchShows(artists, metroID);
        })
    })
    .catch(function(error) {
      console.log('OH NO ' + error + 'in collectConcerts requestHandler.js');
    })
};
