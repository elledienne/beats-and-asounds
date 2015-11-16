# Server Documentation #

## Summary ##
The server handles `GET` requests from the client and is responsible for *all* interactions with the Spotify/Songkick APIs (except during initial authentication when the client is forwarded to Spotify directly).  All the asynchronous opertations are executed using promises.  I will try my best to comment the code thoroughly since I think that will be more useful than giving a super detailed written account of how the request handling works, but as a brief explanation:

Requests from the client are directed to `/myconcerts`, `/myartists`, `/suggestedartists`, or `/login`.  When logging in with spotify, the response is redirected to spotify for authorization and then redirected back to our server to `/callback` with access and refresh tokens for a particular users account.  The `/callback` endpoint is an approved redirect URI that is registered with Spotify.  If you want to change or add to the redirection URIs let me know (lauragelston@gmail.com) and I'll be happy to help.  The request handler for `/callback` uses the access token to obtain the userID and then stores the access token, refresh token, and userID in a users table and the userID in a cookie for subsequent lookups before redirecting to `/myconcerts`.

Requests to `/myconcerts`, `/myartists`, and `/suggestedartits` are protected by a middleware 'checkToken' function that checks for the userID cookie and looks up the user's access token.  If a request doesn't have such a cookie, or the userID is not found in the user table, the server sends a response to go to login and the login is displayed on the home page.  Additionally, this function checks the age of the access token (which expires every hour) and updates it using the user's refresh token if it is more than 50min old.

All requests to any endpoint should have a 'location' parameter ([latitude, longitude]) that is used to find the nearest metro area.  The location information is stored on the client's browser in local storage.  If no location information is provided, the metro area will default to San Francisco/Bay Area.       

## Beats&Sounds API Endpoints ##

|      URL          | HTTP Verb | Request Body |                                   Result                          |
|:-----------------:|:---------:|:------------:|:-----------------------------------------------------------------:|
| /myconcerts       |    GET    |    empty     |            Return JSON for local concerts by artists in playlists |
| /myartists        |    GET    |    empty     |                 Return JSON for local concerts by followed artits |
| /suggestedconcerts|    GET    |     JSON     |                 Return JSON for local concerts by similar artists |
| /login            |    GET    |    empty     |            Return JSON for local concerts by artists in playlists |
