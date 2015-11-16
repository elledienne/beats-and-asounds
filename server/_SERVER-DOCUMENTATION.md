# Server Documentation #

## Summary ##
The server handles `GET` requests from the client and is responsible for *all* interactions with the Spotify/Songkick APIs (except during initial authentication when the client is forwarded to Spotify directly).  All the asynchronous opertations are executed using promises.  I will try my best to comment the code thoroughly since I think that will be more useful than giving a super detailed written account of how the request handling works, but as a brief explanation:

Requests from the client are directed to `/myconcerts`, `/myartists`, `/suggestedartists`, or `/login`.  When logging in with spotify, the response is redirected to spotify for authorization and then redirected back to our server to `/callback` with access and refresh tokens for a particular users account.  The `/callback` endpoint is an approved redirect URI that is registered with Spotify.  If you want to change or add to the redirection URIs let me know (lauragelston@gmail.com) and I'll be happy to help.  The request handler for `/callback` uses the access token to obtain the userID and then stores the access token, refresh token, and userID in a users table and the userID in a cookie for subsequent lookups before redirecting to back to `/`.

Requests to `/myconcerts`, `/myartists`, and `/suggestedartits` are protected by a middleware 'checkToken' function that checks for the userID cookie and looks up the user's access token.  If a request doesn't have such a cookie, or the userID is not found in the user table, the server sends a response to go to login and the login page is displayed.  Additionally, this function checks the age of the access token (which expires every hour) and updates it using the user's refresh token if it is more than 50min old.

All requests to any endpoint should have a 'location' parameter ({location: [latitude, longitude]}) that is used to find the nearest metro area.  The location information is stored on the client's browser in local storage.  If no location information is provided, the metro area will default to San Francisco/Bay Area.       

## Beats&Sounds API Endpoints ##

|        URL        | HTTP Verb |       Request Parm      |                        Response                        |
|:-----------------:|:---------:|:-----------------------:|:------------------------------------------------------:|
| /myconcerts       |    GET    |JSON (location)          | Return JSON for local concerts by artists in playlists |
| /myartists        |    GET    |JSON (location)          | Return JSON for local concerts by followed artits      |
| /suggestedconcerts|    GET    |JSON (location, artistID)| Return JSON for local concerts by similar artists      |
| /login            |    GET    |JSON (location)          | Return JSON for local concerts by artists in playlists |


## Expected Response Format ##

`[ { myCount: 6,
    info:
     { external_urls: [Object],
       followers: [Object],
       genres: [],
       href: 'https://api.spotify.com/v1/artists/4ScCswdRlyA23odg9thgIO',
       id: '4ScCswdRlyA23odg9thgIO',
       images: [ {
          "height" : 816,
          "url" : "https://i.scdn.co/image/eb266625dab075341e8c4378a177a27370f91903",
          "width" : 1000
        }, {
          "height" : 522,
          "url" : "https://i.scdn.co/image/2f91c3cace3c5a6a48f3d0e2fd21364d4911b332",
          "width" : 640
        }, {
          "height" : 163,
          "url" : "https://i.scdn.co/image/2efc93d7ee88435116093274980f04ebceb7b527",
          "width" : 200
        }, {
          "height" : 52,
          "url" : "https://i.scdn.co/image/4f25297750dfa4051195c36809a9049f6b841a23",
          "width" : 64
        } ],
       name: 'Jess Glynne',
       popularity: 83,
       type: 'artist',
       uri: 'spotify:artist:4ScCswdRlyA23odg9thgIO' },
    show:
     { concert_id: 25261749,
       concert_name: 'Jess Glynne with Conrad Sewell at Mezzanine (February 8, 2016)',
       type: 'Concert',
       concert_uri: 'http://www.songkick.com/concerts/25261749-jess-glynne-at-mezzanine?utm_source=37367&utm_medium=partn',
       datetime: '2016-02-08',
       concert_popularity: 0.054622,
       metroarea_id: 26330,
       performer_name: 'Jess Glynne',
       performer_uri: 'http://www.songkick.com/artists/4130211-jess-glynne?utm_source=37367&utm_medium=partner',
       area: 'SF Bay Area',
       venue_name: 'Mezzanine',
       venue_uri: 'http://www.songkick.com/venues/329-mezzanine?utm_source=37367&utm_medium=partner' 
     } 
  }, ......
]`
