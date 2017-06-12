DROP TABLE `guilds`;
CREATE TABLE `guilds` ( 
	`guildid` VARCHAR(30)  NOT NULL, 
	`guildname` VARCHAR(30)  NOT NULL, 
	`ownerid` VARCHAR(30)  NOT NULL, 
	`ownername` VARCHAR(30)  NOT NULL, 
	`timestamp` TIMESTAMP, 
	PRIMARY KEY (guildid)
	);

DROP TABLE `guilds_channels`;
CREATE TABLE `guilds_channels` ( 
	`channelid` VARCHAR(30)  NOT NULL, 
	`guildid` VARCHAR(30)  NOT NULL, 
	`channelname` VARCHAR(30)  NOT NULL, 
	`type` VARCHAR(30)  NOT NULL, 
	`timestamp` TIMESTAMP, 
	PRIMARY KEY (channelid)
	);

DROP TABLE `guilds_settings`;
CREATE TABLE `guilds_settings` ( 
	`id` INT(20)  NOT NULL PRIMARY KEY AUTO_INCREMENT, 
	`settingsid` VARCHAR(30)  NOT NULL, 
	`settingstype` VARCHAR(30), 
	`setting` VARCHAR(30)  NOT NULL, 
	`value` VARCHAR(30)  NOT NULL, 
	`sap` VARCHAR(30), 
	`timestamp` TIMESTAMP,
	INDEX (settingsid)
	);

DROP TABLE `guilds_users`;
CREATE TABLE `guilds_users` ( 
	`id` VARCHAR(60) NOT NULL ,
	`guild` VARCHAR(30)  NOT NULL, 
	`userid` VARCHAR(30)  NOT NULL, 
	`username` VARCHAR(30)  NOT NULL, 
	`role` VARCHAR(30), 
	`timestamp` TIMESTAMP, 
	FULLTEXT (guild, userid),
	PRIMARY KEY (id)
	);


DROP TABLE `guilds_roles`;
CREATE TABLE `guilds_roles` ( 
	`id` VARCHAR(60) NOT NULL ,
	`guild` VARCHAR(30)  NOT NULL, 
	`roleid` VARCHAR(30)  NOT NULL, 
	`rolename` VARCHAR(30)  NOT NULL, 
	`timestamp` TIMESTAMP, 
	FULLTEXT (guild, roleid),
	PRIMARY KEY (id)
	);


DROP TABLE `polls_votes`;
CREATE TABLE `polls_votes` (
	`rowid`	INT(20) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	`id`	INT(20) NOT NULL,
	`user`	VARCHAR(30) NOT NULL,
	`anonym`	TINYINT(20) DEFAULT 0,
	`vote`	TINYINT(20) NOT NULL,
	FULLTEXT (user),
	INDEX(id)
);

INSERT INTO `polls_votes` VALUES (null,2,'218803587491299328',0,1);
INSERT INTO `polls_votes` VALUES (null,2,'218803587491299328',0,2);
INSERT INTO `polls_votes` VALUES (null,3,'218803587491299328',0,1);
INSERT INTO `polls_votes` VALUES (null,3,'218803587491299328',0,3);
INSERT INTO `polls_votes` VALUES (null,3,'218803587491299328',0,1);
INSERT INTO `polls_votes` VALUES (null,3,'218803587491299328',0,2);
INSERT INTO `polls_votes` VALUES (null,3,'218803587491299328',0,2);
INSERT INTO `polls_votes` VALUES (null,3,'218803587491299328',0,3);
INSERT INTO `polls_votes` VALUES (null,3,'218803587491299328',0,1);
INSERT INTO `polls_votes` VALUES (null,3,'218803587491299328',0,3);
INSERT INTO `polls_votes` VALUES (null,3,'218803587491299328',0,1);
INSERT INTO `polls_votes` VALUES (null,14,'218803587491299328',0,1);
INSERT INTO `polls_votes` VALUES (null,14,'218803587491299328',0,4);

DROP TABLE `polls`;
CREATE TABLE `polls` (
	`channel` VARCHAR(30) NOT NULL,
	`guild` VARCHAR(30) NOT NULL,
	`id` INT(20) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	`question` TEXT,
	`active` TINYINT(20) DEFAULT 1,
	`anonym` TINYINT(20),
	FULLTEXT (guild,channel),
	INDEX (active)
	
);

ALTER TABLE `polls`  Engine=InnoDB checksum=1 comment='' delay_key_write=1 row_format=dynamic charset= utf8mb4 COLLATE=utf8mb4_unicode_ci; 


INSERT INTO `polls` VALUES ('254216677196169216','252014907770404864',1,'Do we need a healer?',1,0);
INSERT INTO `polls` VALUES ('254216677196169216','252014907770404864',2,'Do we need a healer?',1,0);
INSERT INTO `polls` VALUES ('254216677196169216','252014907770404864',3,'Do we need a healer?',1,0);
INSERT INTO `polls` VALUES ('254216677196169216','252014907770404864',4,'Do you like this bot?',1,0);
INSERT INTO `polls` VALUES ('254216677196169216','252014907770404864',5,'Do you like this bot?',1,0);
INSERT INTO `polls` VALUES ('254216677196169216','252014907770404864',6,'How long will the maintenance take?',1,0);
INSERT INTO `polls` VALUES ('254216677196169216','252014907770404864',7,'Do we need a healer?',1,0);
INSERT INTO `polls` VALUES ('254216677196169216','252014907770404864',8,'Do we need a healer?',1,0);
INSERT INTO `polls` VALUES ('254216677196169216','252014907770404864',9,'Do we need a healer?',1,0);
INSERT INTO `polls` VALUES ('254216677196169216','252014907770404864',10,'Do we need a healer?',1,0);
INSERT INTO `polls` VALUES ('254216677196169216','252014907770404864',11,'Do we need a healer?',1,0);
INSERT INTO `polls` VALUES ('254216677196169216','252014907770404864',12,'Do we need a healer?',1,1);
INSERT INTO `polls` VALUES ('254216677196169216','252014907770404864',13,'Do we need a healer?',1,1);
INSERT INTO `polls` VALUES ('254216677196169216','252014907770404864',14,'Do we need a healer?',1,1);


DROP TABLE `polls_answers`;
CREATE TABLE `polls_answers` (
	`rowid`	INT(20) NOT NULL PRIMARY KEY AUTO_INCREMENT,
	`id`	INT(20) NOT NULL,
	`answer`	TEXT NOT NULL,
	`number` TINYINT(20) NOT NULL
);

ALTER TABLE `polls_answers`  Engine=InnoDB checksum=1 comment='' delay_key_write=1 row_format=dynamic charset= utf8mb4 COLLATE=utf8mb4_unicode_ci; 

INSERT INTO `polls_answers` VALUES (null,1,'Yes',1);
INSERT INTO `polls_answers` VALUES (null,1,'No',2);
INSERT INTO `polls_answers` VALUES (null,1,'Off-Heal',3);
INSERT INTO `polls_answers` VALUES (null,2,'Yes',1);
INSERT INTO `polls_answers` VALUES (null,2,'No',2);
INSERT INTO `polls_answers` VALUES (null,2,'Off-Heal',3);
INSERT INTO `polls_answers` VALUES (null,3,'Yes',1);
INSERT INTO `polls_answers` VALUES (null,3,'No',2);
INSERT INTO `polls_answers` VALUES (null,3,'Off-Heal',3);
INSERT INTO `polls_answers` VALUES (null,4,':tumbsup:',1);
INSERT INTO `polls_answers` VALUES (null,4,':thumbsdown:',2);
INSERT INTO `polls_answers` VALUES (null,5,':tumbsup:',1);
INSERT INTO `polls_answers` VALUES (null,5,':thumbsdown:',2);
INSERT INTO `polls_answers` VALUES (null,6,'Less than 12 hours',1);
INSERT INTO `polls_answers` VALUES (null,6,'More than 12 hours',2);
INSERT INTO `polls_answers` VALUES (null,7,'Yes',1);
INSERT INTO `polls_answers` VALUES (null,7,'No',2);
INSERT INTO `polls_answers` VALUES (null,7,'Off-Heal',3);
INSERT INTO `polls_answers` VALUES (null,8,'Yes',1);
INSERT INTO `polls_answers` VALUES (null,8,'No',2);
INSERT INTO `polls_answers` VALUES (null,8,'Off-Heal',3);
INSERT INTO `polls_answers` VALUES (null,9,'Yes',1);
INSERT INTO `polls_answers` VALUES (null,9,'No',2);
INSERT INTO `polls_answers` VALUES (null,9,'Off-Heal',3);
INSERT INTO `polls_answers` VALUES (null,10,'Yes',1);
INSERT INTO `polls_answers` VALUES (null,10,'No',2);
INSERT INTO `polls_answers` VALUES (null,10,'Off-Heal',3);
INSERT INTO `polls_answers` VALUES (null,11,'Yes',1);
INSERT INTO `polls_answers` VALUES (null,11,'No',2);
INSERT INTO `polls_answers` VALUES (null,11,'Off-Heal',3);
INSERT INTO `polls_answers` VALUES (null,12,'Yes',1);
INSERT INTO `polls_answers` VALUES (null,12,'No',2);
INSERT INTO `polls_answers` VALUES (null,12,'Off-Heal',3);
INSERT INTO `polls_answers` VALUES (null,13,'Yes',1);
INSERT INTO `polls_answers` VALUES (null,13,'No',2);
INSERT INTO `polls_answers` VALUES (null,13,'Off-Heal',3);
INSERT INTO `polls_answers` VALUES (null,14,'Yes',1);
INSERT INTO `polls_answers` VALUES (null,14,'No',2);
INSERT INTO `polls_answers` VALUES (null,14,'Off-Heal',3);
INSERT INTO `polls_answers` VALUES (null,14,'Tanky one',4);

ALTER DATABASE foxbot CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
ALTER TABLE polls CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; 
ALTER TABLE polls_answers CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; 
ALTER TABLE polls MODIFY COLUMN question TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;
ALTER TABLE polls_answers MODIFY COLUMN answer TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;

/// ALSO CHANGE /etc/my.cnf

[client]
default-character-set = utf8mb4

[mysql]
default-character-set = utf8mb4

[mysqld]
character-set-client-handshake = FALSE
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

//// 