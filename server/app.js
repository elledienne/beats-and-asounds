var express = require('express');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var spotify = require('./spotifyInt.js');
var songkick = require('./songkickInt.js');
var util = require('./utils.js');


var app = express();

app.use(session({
  secret: "super secret string"
}));

app.use(express.static(__dirname + '/../public'))
  .use(cookieParser());

app.get('/login', function(req, res) {
  spotify.authorize(res);
});

app.get('/callback', util.checkState,
  function(req, res) {
    var code = req.query.code;

    spotify.getToken(code)
      .then(function(access_token, refresh_token) {
        return spotify.findUser(access_token)
          .then(function(userID) {
            return util.generateSession(req, access_token, refresh_token, userID)
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
  });

app.get('/myconcerts', util.checkToken,
  function(req, res) {

    var token = req.session.accessToken;
    var userID = req.session.userID;
    var location = req.query.location;

    spotify.getPlaylists(token, userID)
      .then(function(playlists) {
        return spotify.getTracks(token, userID, playlists);
      }).then(function(tracks) {
        return spotify.getArtists(tracks);
      }).then(function(artists) {
        return songkick.findMyMetroArea(location)
          .then(function(metroID) {
            return songkick.findConcerts(metroID);
          }).then(function(concerts) {
            return util.findMyConcerts(artists, concerts);
          }).then(function(myShows) {
            res.json(myShows);
          })
      });
  });

app.get('/suggestedconcerts', util.checkToken,
  function(req, res) {


  });

app.get('/myartists', util.checkToken,
  function(req, res) {
    console.log("in /myartists");
    spotify.getMyArtists(req.session.accessToken, function(artists) {
      // songkick stuff;
    })

  });

app.get('/refresh_token', function(req, res) {
  spotify.refreshToken(req, res);
});

console.log('Listening on 8888');
app.listen(8888);
