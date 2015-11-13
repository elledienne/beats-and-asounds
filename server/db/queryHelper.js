module.exports = {
  performer: 'INSERT IGNORE INTO performer (performer_id, name, uri) VALUES (?, ?, ?)',
  metroarea: 'INSERT IGNORE INTO metroarea (sk_id, area) VALUES (?, ?)',
  venue: 'INSERT IGNORE INTO venue (sk_id, name, uri) VALUES (?, ?, ?)',
  concert: 'INSERT IGNORE INTO concert (concert_id, name, type, uri, datetime, popularity, venue_id, headline_id, metroarea_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  join: 'INSERT IGNORE INTO concert_performer (concert_id, performer_id) VALUES (?, ?)'
};

