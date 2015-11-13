module.exports = {
  performer: 'INSERT IGNORE INTO performer (performer_id, performer_name, performer_uri) VALUES (?, ?, ?)',
  metroarea: 'INSERT IGNORE INTO metroarea (sk_id, area) VALUES (?, ?)',
  venue: 'INSERT IGNORE INTO venue (sk_id, venue_name, venue_uri) VALUES (?, ?, ?)',
  concert: 'INSERT IGNORE INTO concert (concert_id, concert_name, type, concert_uri, datetime, concert_popularity, venue_id, metroarea_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  join: 'INSERT IGNORE INTO concert_performer (concert_id, performer_id) VALUES (?, ?)',

  userSelect: "SELECT * FROM user WHERE userID=?",
  userInsert: "INSERT INTO user (access_token, refresh_token, userID, created_at) VALUES (?,?,?,?)",
  userFetch: "SELECT *  FROM user WHERE userID=?",
  metroFetch: "SELECT * FROM metroarea WHERE sk_id = ?",
  concertFetch: "SELECT c.concert_id, c.concert_name, c.type, c.concert_uri, c.datetime, c.concert_popularity, c.metroarea_id, p.performer_name, p.performer_uri, m.area, v.venue_name, v.venue_uri FROM concert c INNER JOIN concert_performer cp ON(c.concert_id = cp.concert_id) INNER JOIN performer p ON(cp.performer_id = p.performer_id) INNER JOIN metroarea m ON(c.metroarea_id = m.sk_id) INNER JOIN venue v ON(c.venue_id = v.sk_id) WHERE m.sk_id = ? AND p.performer_name = ?"
};
