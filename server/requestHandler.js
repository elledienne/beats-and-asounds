var spotify = require('./spotifyInt.js');
var songkick = require('./songkickInt.js');
var util = require('./utils.js');


module.exports.callback = function(req, res) {
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
};

module.exports.myConcerts = function(req, res) {
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

};

module.exports.suggestedConcerts = function(req, res) {

};

module.exports.myArtists = function(req, res) {
  var token = req.session.accessToken;
  spotify.getMyArtists(token).then(function(artists) {
    //blah blah blah
  })
};
