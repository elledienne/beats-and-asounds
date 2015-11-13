module.exports = {
  performer: 'INSERT IGNORE INTO performer (performer_id, performer_name, performer_uri) VALUES (?, ?, ?)',
  metroarea: 'INSERT IGNORE INTO metroarea (sk_id, area) VALUES (?, ?)',
  venue: 'INSERT IGNORE INTO venue (sk_id, venue_name, venue_uri) VALUES (?, ?, ?)',
  concert: 'INSERT IGNORE INTO concert (concert_id, concert_name, type, concert_uri, datetime, concert_popularity, venue_id, headline_id, metroarea_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  join: 'INSERT IGNORE INTO concert_performer (concert_id, performer_id) VALUES (?, ?)'
};
