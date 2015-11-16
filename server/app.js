var express = require('express');
var cookieParser = require('cookie-parser');
var context = require('request-context');

var spotify = require('./spotifyInt.js');
var songkick = require('./songkickInt.js');
var util = require('./utils.js');
var requestHandler = require('./requestHandler.js');

var app = express();

app.use(express.static(__dirname + '/../public'))
  .use(cookieParser())
  .use(context.middleware('request'));

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

app.use(function(req, res, next) {
  res.status(404).send('Not a valid endpoint');
})

console.log('Listening on 8888');
app.listen(8888);
