CREATE DATABASE foxbot;
USE foxbot
CREATE USER 'fox'@'localhost' IDENTIFIED BY 'riddim';
GRANT ALL PRIVILEGES ON foxbot.* To 'fox'@'localhost';
FLUSH PRIVILEGES;

set global net_buffer_length=1000000; 
set global max_allowed_packet=1000000000; 

CREATE TABLE `stats` ( `id` VARCHAR(200), `guild` TEXT, `user` TEXT, `command` TEXT, `count` TEXT, `options` TEXT, UNIQUE KEY (id) );
CREATE TABLE `youtube` ( `id` VARCHAR(200) NOT NULL, `date` DATE, `recommender` VARCHAR(200), `youtuber` VARCHAR(200), `title` TEXT,   UNIQUE KEY (id) );
CREATE TABLE `servers`  (`id` VARCHAR(20) NOT NULL, `time` TIMESTAMP, `status` TEXT,   UNIQUE KEY (id) );

INSERT INTO `servers` (id, time, status) VALUES ("EU", NOW(), "UP");
INSERT INTO `servers` (id, time, status) VALUES ("NA", NOW(), "UP");
INSERT INTO `servers` (id, time, status) VALUES ("PTS", NOW(), "DOWN");
INSERT INTO `servers` (id, time, status) VALUES ("PS4 - EU", NOW(), "UP");
INSERT INTO `servers` (id, time, status) VALUES ("PS4 - US", NOW(), "UP");
INSERT INTO `servers` (id, time, status) VALUES ("XBox - US", NOW(), "UP");
INSERT INTO `servers` (id, time, status) VALUES ("XBox - EU", NOW(), "UP");
INSERT INTO `servers` (id, time, status) VALUES ("_launcher", NOW(), "xxx");
INSERT INTO `servers` (id, time, status) VALUES ("_forums", NOW(), "xxx2");

SET GLOBAL sql_mode="STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION";
SET SESSION sql_mode="STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION";

# import files:
vendors.db.sql

# statistics

SELECT guild, SUM(count) FROM stats GROUP BY guild;
SELECT command, SUM(count) FROM stats WHERE guild = "252014907770404864" GROUP BY command;
SELECT user, SUM(count) FROM stats WHERE guild = "252014907770404864" GROUP BY user;

DROP TABLE items_summary;
CREATE TABLE IF NOT EXISTS items_summary (
                        id BIGINT NOT NULL AUTO_INCREMENT,
                        logId BIGINT NOT NULL DEFAULT 0,
                        link TEXT(200),
                        itemId BIGINT NOT NULL NOT NULL DEFAULT 0,
                        internalLevel TEXT(200) ,
                        internalSubtype TEXT(200) ,
                        potionData TEXT(200) ,
                        name TEXT(200),
                        dyeData TEXT(200),
                        tags TINYTEXT,
                        description TEXT(200) ,
                        style TEXT(200),
                        trait TEXT(200),
                        quality TEXT(200),
                        value CHAR(64) ,
                        level CHAR(64),
                        type TEXT(200),
                        specialType TEXT(200),
                        equipType TEXT(200) ,
                        weaponType TEXT(200) ,
                        armorType TEXT(200) ,
                        craftType TEXT(200) ,
                        armorRating TEXT(200) ,
                        weaponPower TEXT(200) ,
                        cond TEXT(200) ,
                        enchantId TEXT(200) ,
                        enchantLevel TEXT(200) ,
                        enchantSubtype TEXT(200) ,
                        enchantName TINYTEXT,
                        enchantDesc TEXT,
                        numCharges TEXT(200) ,
                        maxCharges TEXT(200) ,
                        abilityName TEXT(200) ,
                        abilityDesc TEXT(200) ,
                        abilityCooldown TEXT(200) ,
                        setName TEXT(200),
                        setBonusCount TEXT(200) ,
                        setMaxEquipCount TEXT(200) ,
                        setBonusCount1 TEXT(200) ,
                        setBonusCount2 TEXT(200) ,
                        setBonusCount3 TEXT(200) ,
                        setBonusCount4 TEXT(200) ,
                        setBonusCount5 TEXT(200) ,
                        setBonusDesc1 TEXT,
                        setBonusDesc2 TEXT,
                        setBonusDesc3 TEXT,
                        setBonusDesc4 TEXT,
                        setBonusDesc5 TEXT,
                        glyphMinLevel TEXT(200) ,
                        glyphMaxLevel TEXT(200) ,
                        runeType TEXT(200) ,
                        runeRank TEXT(200) ,
                        bindType TEXT(200) ,
                        siegeHP TEXT(200) ,
                        bookTitle TINYTEXT,
                        craftSkillRank TEXT(200) ,
                        recipeRank TEXT(200) ,
                        recipeQuality TEXT(200) ,
                        refinedItemLink TEXT(200),
                        resultItemLink TEXT(200),
                        materialLevelDesc TEXT(200),
                        traitDesc TINYTEXT,
                        traitAbilityDesc TEXT(200),
                        traitCooldown TEXT(200) ,
                        isUnique TEXT(200),
                        isUniqueEquipped TEXT(200) ,
                        isVendorTrash TEXT(200) ,
                        isArmorDecay TEXT(200) ,
                        isConsumable TEXT(200) ,
                        icon TEXT(200),
                        PRIMARY KEY (id),
                        INDEX index_link (link(64)),
                        INDEX index_itemId (itemId),
                        FULLTEXT(name),
                        FULLTEXT(description),
                        FULLTEXT(setName),
                        FULLTEXT(abilityName),
                        FULLTEXT(abilityDesc),
                        FULLTEXT(setBonusDesc1, setBonusDesc2, setBonusDesc3, setBonusDesc4, setBonusDesc5),
                        FULLTEXT(bookTitle)
                );

ALTER TABLE items_sets ADD PRIMARY KEY (id);
ALTER TABLE items_sets ADD FULLTEXT(setName,setBonusDesc1, setBonusDesc2, setBonusDesc3, setBonusDesc4, setBonusDesc5);

                
LOAD DATA LOCAL INFILE "itemSummary.csv" INTO TABLE foxbot.items_summary fields terminated BY ",";      