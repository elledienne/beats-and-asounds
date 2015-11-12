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

app.get('/callback', function(req, res) {
  spotify.getToken(req, res);
});

app.get('/myconcerts', util.checkToken,
  function(req, res) {
    var token = req.session.accessToken;
    var userID = req.session.userID;
    spotify.getPlaylists(token, userID, function(token, userID, playlists) {
      spotify.getTracks(token, userID, playlists, function(tracks) {
        spotify.getArtists(tracks, function(artists) {
          songkick.findConcerts(function(concerts) {
            util.findMyConcerts(artists, concerts, function(myShows) {
              res.json(myShows);
            });
          });
        });
      });
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
