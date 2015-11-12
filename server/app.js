var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var spotify = require('./spotifyInt.js');
var songkick = require('./songkickInt.js');
var util = require('./utils.js');
var requestHandler = require('./requestHandler.js');


var app = express();

app.use(session({
  secret: "super secret string"
}));

app.use(express.static(__dirname + '/../public'))
  .use(cookieParser());

app.get('/login', function(req, res) {
  spotify.authorize(req, res);
});

app.get('/callback', util.checkState,
  function(req, res) {
    requestHandler.callback(req, res);
  });

app.get('/myconcerts', util.checkToken,
  function(req, res) {
    requestHandler.myConcerts(req, res);
  });

app.get('/suggestedconcerts', util.checkToken,
  function(req, res) {
    requestHandler.suggestedConcerts(req, res);
  });

app.get('/myartists', util.checkToken,
  function(req, res) {
    requestHandler.myArtists(req, res);

  });

app.get('/refresh_token', function(req, res) {
  spotify.refreshToken(req, res);
});

console.log('Listening on 8888');
app.listen(8888);
