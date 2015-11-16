var expect = require('chai').expect;
var request = require('supertest');
var spotify = require('./spotifyInt.js');
var query = require('./db/dbHelper.js');
var songkick = require('./songkickInt.js');
var app = require('./app.js');

//Test account :
//email : beatsandsounds@sharkslasers.com
//password : test

//If you open the test account be sure that it doesn't sync with your iTunes playlists or this will break

var access_token = 'BQDXmhzoEPynmEKP02Ei1RAnIqppzkqbdkEoaXn5w9B23FHJn_FnTZA7A4zJ6nW2bmrNDWfcX49NrNdo3m7zRPPWzjFuZ8pOM9hmmB6uUda7QrQYRhjMH5A6nWuivPRVeMY9hRQI5AVS1vx6F85lm-4G-VHYld4mUXglpj4pJpUaRrnnGQ';
var refresh_token = 'AQC25UxxqH2Cx9cwaFOC9NTysFt_WdIvyMYSK4ma_jYHGULM4b4gtrZr3mTqZ0O5_PXitr6c0StwMiYca6nc3aetvgUL-2ca29EmqO79Ta8f-tGmFCpVbzjiWnZJRGKi2qM';
var userID = 'beatsandsoundstest';
var location = [37.783716, -122.40918939999999]

describe('Spotify interaction', function() {

  it('Should use refresh token to update access token and store it in database', function(done) {
    //Add test user to database
    query.addUserToDatabase(access_token, refresh_token, userID)
      .then(function() {
        //Request new access token for test user
        return spotify.refreshToken(refresh_token);
      }).then(function(body) {
        return query.updateUser(body.access_token, body.refresh_token, userID)
      }).then(function() {
        return query.fetchToken(userID);
      }).then(function(userTokens) {
        expect(userTokens[0].userID).to.equal('beatsandsoundstest');
        expect(userTokens[0].access_token).to.not.equal(access_token);
        //Update access token for future tests
        access_token = userTokens[0].access_token;
        done();
      });
  });

  it('Should fetch userID from access token', function(done) {
    spotify.findUser(access_token).then(function(user) {
      expect(user).to.equal('beatsandsoundstest');
      done();
    });
  });
  it('Should fetch followed artists', function(done) {
    spotify.getMyArtists(access_token).then(function(artists) {
      expect(artists['MADONNA']).to.not.be.undefined;
      done();
    })
  });
  it('Should fetch tracks in user\'s playlists', function(done) {
    spotify.getPlaylists(access_token, userID).then(function(playlists) {
      return spotify.getTracks(access_token, userID, playlists)
    }).then(function(tracks) {
      expect(tracks.length).to.equal(1);
      expect(tracks[0].items[0].track.artists[0].name).to.equal('Beyoncé');
      expect(tracks[0].items[0].track.name).to.equal('Drunk in Love');
      done();
    });
  });
});

describe('Songkick interaction', function() {
  it('Should fetch the user\'s closest metroarea', function(done) {
    songkick.findMyMetroArea(location).then(function(metroID) {
      expect(metroID).to.equal(26330);
      done();
    });
  });
  it('Should default to SF if no metroarea is provided', function(done) {
    songkick.findMyMetroArea("").then(function(metroID) {
      expect(metroID).to.equal(26330);
      done();
    });
  });
});

describe('End-to-end', function() {
  it('Should redirect to login if there is no userID cookie', function(done) {
    request(app)
      .get('/myconcerts')
      .end(function(err, result) {
        expect(result.text).to.equal('go to login');
        done();
      });
  })
  it('Should return array of concerts', function(done) {
    request(app)
      .get('/myconcerts')
      .set('Cookie', 'userID=beatsandsoundstest')
      .end(function(err, result) {
        expect(result.body).to.be.instanceof(Array);
        done();
      });
  });
});
