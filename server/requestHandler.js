var querystring = require('querystring');
var context = require('request-context');

var spotify = require('./spotifyInt.js');
var songkick = require('./songkickInt.js');
var util = require('./utils.js');

var query = require('./db/dbHelper.js');



module.exports.callback = function(req, res) {
  //Spotify redirects the request with a authorization code that can be exchanged for a user's token, this token needs to be included in all the requests to spotify that require user authorization
  var code = req.query.code;
  spotify.getToken(code)
    .catch(function(error) {
      console.log('OH NO ' + error);
      res.redirect('/#' +
        querystring.stringify({
          error: 'invalid_token'
        }));
    })
    .then(function(tokens) {
      var access_token = tokens[0];
      var refresh_token = tokens[1];
      //Information about user is retrieved using access token
      return spotify.findUser(access_token)
        .then(function(userID) {
          //UserID is saved on a cookie so we know who they are during future requests
          res.cookie("userID", userID, {
            maxAge: 900000,
            httpOnly: true
          });
          //User is added to DB with their access token and refresh token (it's unsafe to set tokens as cookies)
          return query.addUserToDatabase(access_token, refresh_token, userID)
            .then(function() {
              res.status(301).redirect('/');
            });
        });
    })
    .catch(function(error) {
      console.log('OH NO ' + error);
    });
};

module.exports.myConcerts = function(req, res) {

  var userID = req.cookies.userID;
  //request context is set in utils.checkToken so we don't need to query for the userID in the database twice
  var token = context.get('request:token');
  var location = req.query.location;

  return spotify.getPlaylists(token, userID)
    .then(function(playlists) {
      return spotify.getTracks(token, userID, playlists);
    }).then(function(tracks) {
      //tracks is enough information to get names of the artists, but in order to get the images used on the front end we need to make another request to Spotify for the full artist object
      return spotify.getArtists(tracks);
    }).then(function(artists) {
      return module.exports.collectConcerts(location, artists);
    }).then(function(myShows) {
      res.status(200).json(myShows);
    });

};

module.exports.suggestedConcerts = function(req, res) {
  var location = req.query.location;
  var artistID = req.query.artistID;
  console.log(artistID, req.query);

  return spotify.getRelatedArtists(artistID)
    .then(function(artists) {
      return module.exports.collectConcerts(location, artists);
    }).then(function(myShows) {
      res.status(200).json(myShows);
    })
};

module.exports.myArtists = function(req, res) {
  var userID = req.cookies.userID;
  var token = context.get('request:token');
  var location = req.query.location;

  spotify.getMyArtists(token)
    .then(function(artists) {

      return module.exports.collectConcerts(location, artists);
    }).then(function(myShows) {
      res.status(200).json(myShows);
    });
};

//collectConcerts finds concerts for given artists at a given location (coordinates) and compiles the information into the format expected on the front end
module.exports.collectConcerts = function(location, artists) {
  return songkick.findMyMetroArea(location)
    .then(function(metroID) {
      return query.checkForMetroID(metroID)
        .then(function(metroInfo) {
          //If concerts for that metroID are not already in the database, request them from Songkick and archive them
          if (!metroInfo.length) {
            return songkick.findConcerts(metroID);
          }
        }).then(function() {
          //Fetch concerts from the database
          return query.fetchShows(artists, metroID);
        })
    })
    .catch(function(error) {
      console.log('OH NO ' + error);
    })
};
