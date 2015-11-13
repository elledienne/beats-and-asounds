/*  Execute this file from the command line by typing:
 *    mysql -u root -p < server/db/schema.sql
 *  to create the database and the tables.
 *  
 *  TODO: ADD THIS COMMAND TO GRUNT!!
 */

-- FOR DEPLOYMENT: COMMENT THE LINE BELOW!!
DROP DATABASE IF EXISTS `chubbySongDB`;
CREATE DATABASE chubbySongDB;

USE chubbySongDB;

-- ---
-- If you need to delete/edit/whatever a table that is linked to another table
-- you need to uncomment the line below, otherwise MySQL will not allow you to do that
-- ---

-- SET FOREIGN_KEY_CHECKS=0;

-- ---
-- Table 'concert'
-- 
-- ---

DROP TABLE IF EXISTS `concert`;
    
CREATE TABLE `concert` (
  -- We are using their id to maintain consistency between our and their data :)
  -- `id` INTEGER AUTO_INCREMENT,
  `concert_id` INTEGER(8) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `type` VARCHAR(30) DEFAULT 'Concert',
  `uri` VARCHAR(100) NOT NULL,
  `datetime` VARCHAR(35) NOT NULL,
  `popularity` FLOAT DEFAULT 0,
  -- `age_restrictions` // TODO: Check where/if is this guy in the response?
  `venue_id` INTEGER(8) NOT NULL,
  `headline_id` INTEGER(8) DEFAULT NULL,
  `metroarea_id` INTEGER(15) NOT NULL,
  PRIMARY KEY (`concert_id`)
  
);

-- ---
-- Table 'performer'
-- 
-- ---

DROP TABLE IF EXISTS `performer`;
    
CREATE TABLE `performer` (
  -- `id` INTEGER AUTO_INCREMENT,
  -- As for concert table: we are reusing the SongKick id
  `performer_id` INTEGER(8) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `uri` VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (`performer_id`)
  
);

-- ---
-- Table 'concert_performer'
-- 
-- ---

DROP TABLE IF EXISTS `concert_performer`;
    
CREATE TABLE `concert_performer` (
  -- As for concert table: we are reusing the SongKick id
  -- `id` INTEGER AUTO_INCREMENT,
  `concert_id` INTEGER(8) NOT NULL,
  `performer_id` INTEGER(8) NOT NULL,
  PRIMARY KEY (`concert_id`)
  
);

-- ---
-- Table 'metroarea'
-- 
-- ---

DROP TABLE IF EXISTS `metroarea`;
    
CREATE TABLE `metroarea` (
  -- Guess where are we taking this id :)
  `sk_id` INTEGER(15) NOT NULL,
  `area` VARCHAR(100) DEFAULT NULL,
  -- `location` VARCHAR(150) DEFAULT NULL,
  PRIMARY KEY (`sk_id`)
);

-- ---
-- Table 'venue'
-- 
-- ---

DROP TABLE IF EXISTS `venue`;
    
CREATE TABLE `venue` (
  -- Yeah, you got it
  `sk_id` INTEGER(15) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `uri` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`sk_id`)
  
);


-- ---
-- Tables Indexes
-- ---

ALTER TABLE `concert` ADD INDEX (`type`, `metroarea_id`);
ALTER TABLE `performer` ADD INDEX (`name`);
ALTER TABLE `concert_performer` ADD INDEX (`performer_id`);
-- The key below is commented because i don't think you'll need 
-- to index the table by area, but if you do, just uncomment it
-- ALTER TABLE `metroarea` ADD INDEX (`area`)

-- ---
-- Foreign Keys 
-- ---

-- ALTER TABLE `concert` ADD FOREIGN KEY (`concert_id`) REFERENCES `concert_performer` (`concert_id`);
ALTER TABLE `concert_performer` ADD FOREIGN KEY (`concert_id`) REFERENCES `concert` (`concert_id`);
ALTER TABLE `concert_performer` ADD FOREIGN KEY (`performer_id`) REFERENCES `performer` (`performer_id`);
-- TODO: Probably the line below is worng, as the logic that is behind it. Figure it out :D
-- For the moment replaced by the next line
-- ALTER TABLE `performer` ADD FOREIGN KEY (`performer_id`) REFERENCES `concert_performer` (`performer_id`);
-- ALTER TABLE `concert_performer` ADD FOREIGN KEY (`performer_id`) REFERENCES `performer` (`performer_id`);


ALTER TABLE `concert` ADD FOREIGN KEY (`headline_id`) REFERENCES `performer` (`performer_id`);
ALTER TABLE `concert` ADD FOREIGN KEY (`metroarea_id`) REFERENCES `metroarea` (`sk_id`);
ALTER TABLE `concert` ADD FOREIGN KEY (`venue_id`) REFERENCES `venue` (`sk_id`);