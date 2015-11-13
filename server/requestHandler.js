var querystring = require('querystring');

var spotify = require('./spotifyInt.js');
var songkick = require('./songkickInt.js');
var util = require('./utils.js');

var query = require('./db/dbHelper.js');



module.exports.callback = function(req, res) {
  var code = req.query.code;
  spotify.getToken(code)
    .then(function(access_token, refresh_token) {
      return spotify.findUser(access_token, refresh_token)
        .then(function(userID) {
          res.cookie("userID", userID, {
            maxAge: 900000,
            httpOnly: true
          });
          return query.addUserToDatabase(access_token, refresh_token, userID)
            // return util.generateSession(req, access_token, refresh_token, userID)
            .then(function() {
              res.redirect('/');
            });
        })
        .catch(function(err) {
          console.log('OH NO (in /callback) ' + err);
        });
    })
    .catch(function() {
      res.redirect('/#' +
        querystring.stringify({
          error: 'invalid_token'
        }));
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
          console.log(artists, "artists in req handler");
          return songkick.findMyMetroArea(location)
            .then(function(metroID) {
              return query.checkForMetroID(metroID)
                .then(function(metroInfo) {
                  if (!metroInfo.length) {
                    return songkick.findConcerts(metroID);
                  } else {
                    return;
                  }
                }).then(function() {
                  console.log(artists, 'artists before pass to fetch')
                  return query.fetchShows(artists, metroID);
                }).then(function(myShows) {
                  console.log(myShows, "here");
                  res.json(myShows);
                })
            });
        });
    });
};

module.exports.suggestedConcerts = function(req, res) {

};

module.exports.myArtists = function(req, res) {
  var token = req.session.accessToken;
  spotify.getMyArtists(token).then(function(artists) {
    //blah blah blah
  })
};
