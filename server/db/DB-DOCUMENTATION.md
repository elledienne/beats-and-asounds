# The Database

### Schema

First of all check the 'SQL Schema.png' image in this folder to have a general idea of how the db is built. IMPORTANT: the final schema is a little bit different (some column names are different).

You can see the complete anatomy of the db inside schema.sql

## Input data

The main purpose of this db is storing data that we get from songkick.
We are implementing thid db because the songkick api is a little bit crappy, infact it's impossible to specify what artist you want when you do a 'metro area's upcoming events' request. This means that the JSON that SK is sending back is HUGE (around 15 seconds to receive it!).

The JSON string follows this pattern:

```javascript
{
  "resultsPage:" {
    "results": { "event": [
      {
        "id":11129128,
        "type":"Concert",
        "uri":"http://www.songkick.com/concerts/and/so/on",
        "displayName":"Wild Flag at The Fillmore (April 18, 2012)",
        "start":{"time":"20:00:00",
                 "date":"2012-04-18",
                 "datetime":"2012-04-18T20:00:00-0800"},
        "performance":[{"artist":{
                          "uri":"http://www.songkick.com/artists/blablabla",
                          "displayName":"Wild Flag",
                          "id":29835,
                          "identifier":[]
                        },
                        "displayName":"Wild Flag",
                        "billingIndex":1,
                        "id":21579303,
                        "billing":"headline"
                       }],
        "location":{"city":"San Francisco, CA, US","lng":-122.4332937,"lat":37.7842398},
        "venue":{"id":6239,
                 "displayName":"The Fillmore",
                 "uri":"http://www.songkick.com/venues/blablabla",
                 "lng":-122.4332937, "lat":37.7842398,
                 "metroArea":{"uri":"http://www.songkick.com/metro_areas/blablabla",
                              "displayName":"SF Bay Area",
                              "country":{"displayName":"US"},
                              "id":26330,
                              "state":{"displayName":"CA"}
                              }}, 
        "status":"ok",
        "popularity":0.012763
      }, ....
    ]},
    "totalEntries":24,
    "perPage":50,
    "page":1,
    "status":"ok"
  }
}
```

If you need more info: http://www.songkick.com/developer/upcoming-events-for-metro-area

### Save data to the db

As you saw our db uses multiple table to store data in the most efficient way.

All the tables are linked together using foreign keys, this means that you have to follow a specific order when adding data (not for all the tables, but anyway it's a good idea to skin on this guide)

Below the complete process:

1. **Add our artist/artists.**

IMPORTANT: every time you see an id (like performer_id, sk_id, whatever_id) in the db you should now that it's the corrispondent songkick id!

Query:

```sql
INSERT INTO performer (performer_id, name, uri) VALUES (artist.id, artist.displayName, artist.uri)
```

2. **Add metroarea**

Query:

```sql
INSERT INTO metroarea (sk_id, area) VALUES (metroArea.id, metroArea.displayName)
```

3. **Add venue**

Query:
```sql
INSERT INTO venue (sk_id, name, uri) VALUES (venue.id, venue.displayName, venue.uri)
```

4. **Now that we have all this setted up we can insert our concert**

Query:

```sql
INSERT INTO concert (concert_id, name, type, uri, datetime, popularity, venue_id, headline_id, metroarea_id) VALUES (id, displayName, type, uri, start.datetime, popularity, venue.id, HEADLINE_ID, metroarea_id)
```

> HEADLINE_ID is placeholder for the id of the artist that is the headline of the event. You should find this data in some way (looping over the artists array?)

5. **Last step is linking you events with all the artists that ar performing in our join table** (yeah, they can be more than one!)

JAVASCRIPT:

```sql
INSERT INTO concert_performer (concert_id, performer_id) VALUES (?, ?)
```

### Retrive data from db
Inserting data it's a little bit complicated, it's true, but makes selecting data very easy (and powerfull).

Let's see how to do that

Query:

```javascript
SELECT c.concert_id,
       c.name,
       c.type,
       c.uri,
       c.datetime,
       c.popularity,
       c.venue_id,
       c.headline,
       c.metroarea_id,
       p.name,
       p.uri,
       m.area,
       v.name,
       v.uri
       FROM concert AS c 
  INNER JOIN concert_performer AS cf ON (c.concert_id = cf.concert_id)
  INNER JOIN performer AS f ON (cd.performer_id = f.performer_id)
  INNER JOIN metroarea AS m ON (c.metroarea_id = m.sk_id)
  INNER JOIN venue AS v ON (c.venue_id = v.sk_id);
```

### Handling asynchronousity

We know that you know, but just to be sure: **all the DB operations are ASYNC**

In our implementation we handle that using promises ([bluebird](http://bluebirdjs.com/docs/getting-started.html)).

---

And (hopefully) that's all :D




