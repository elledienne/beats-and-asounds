var express = require('express');
var cookieParser = require('cookie-parser');
//Request-context allows you to set and access data on the current request, it's used in the util.checkToken function that fetches and validates a user's access token
//https://www.npmjs.com/package/request-context
var context = require('request-context');

var spotify = require('./spotifyInt.js');
var songkick = require('./songkickInt.js');
var util = require('./utils.js');
var requestHandler = require('./requestHandler.js');

// required for automating webworker
var CronJob = require('cron').CronJob;
var stachanov = require('./worker/dbStachanov.js');

var app = express();

app.use(express.static(__dirname + '/../public'))
  .use(cookieParser())
  //Wrap request handling for current request lifecycle in a 'request' domain
  .use(context.middleware('request'));

//More information about authenticating with Spotify via authorization code flow:
//https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
app.get('/login', function(req, res) {
  spotify.authorize(req, res);
});

//Spotify redirects back to /callback after user authentication
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

app.get('/logout', util.checkToken,
  function(req, res) {
    console.log('here');
    res.clearCookie('userID');
    res.redirect('/');
  });

app.use(function(req, res, next) {
  res.status(404).send('Not a valid endpoint');
});


var workerJob = new CronJob('0 1 * * 5', function(){
    // This runs every 30
    stachanov.deleteExpiredEvents();
    stachanov.updateOldByAreas();
    //workerJob.stop();
  }, function () {
    /* This function is executed when the job stops */
    console.log('Cron stopped!');
  },
  true, /* Start the job right now */
  timeZone = 'America/Los_Angeles' /* Time zone of this job. */
);

console.log('Listening on 8888');
app.listen(8888);

module.exports = app;
