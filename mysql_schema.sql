-- MySQL dump 10.13  Distrib 5.7.19, for macos10.12 (x86_64)
--
-- Host: localhost    Database: foxbot
-- ------------------------------------------------------
-- Server version	5.7.19

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `guilds`
--

DROP TABLE IF EXISTS `guilds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `guilds` (
  `guildid` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guildname` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ownerid` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ownername` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`guildid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `guilds_channels`
--

DROP TABLE IF EXISTS `guilds_channels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `guilds_channels` (
  `channelid` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guildid` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `channelname` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`channelid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `guilds_roles`
--

DROP TABLE IF EXISTS `guilds_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `guilds_roles` (
  `id` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guild` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roleid` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rolename` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FULLTEXT KEY `guild` (`guild`,`roleid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `guilds_settings`
--

DROP TABLE IF EXISTS `guilds_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `guilds_settings` (
  `id` int(20) NOT NULL AUTO_INCREMENT,
  `settingsid` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `settingstype` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `setting` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sap` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `settingsid` (`settingsid`)
) ENGINE=InnoDB AUTO_INCREMENT=5667 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `guilds_users`
--

DROP TABLE IF EXISTS `guilds_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `guilds_users` (
  `id` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guild` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userid` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FULLTEXT KEY `guild` (`guild`,`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `items_prices_ttc`
--

DROP TABLE IF EXISTS `items_prices_ttc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `items_prices_ttc` (
  `id` int(20) DEFAULT NULL,
  `megaserver` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quality` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trait` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vouchers` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `countEntry` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `countAmount` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `suggested` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avg` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `max` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `min` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rowid` int(20) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`rowid`),
  KEY `id` (`id`,`quality`,`level`,`trait`,`vouchers`)
) ENGINE=InnoDB AUTO_INCREMENT=116937 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `items_prices_ttc_info`
--

DROP TABLE IF EXISTS `items_prices_ttc_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `items_prices_ttc_info` (
  `id` int(20) DEFAULT NULL,
  `megaserver` varchar(20) DEFAULT NULL,
  `timestamp` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `items_prices_uesp`
--

DROP TABLE IF EXISTS `items_prices_uesp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `items_prices_uesp` (
  `id` int(20) DEFAULT NULL,
  `Item` varchar(20) DEFAULT NULL,
  `Level` varchar(20) DEFAULT NULL,
  `Quality` varchar(20) DEFAULT NULL,
  `Item_ID` varchar(20) DEFAULT NULL,
  `Internal_Level` varchar(20) DEFAULT NULL,
  `Internal_Subtype` varchar(20) DEFAULT NULL,
  `Item_Type` varchar(20) DEFAULT NULL,
  `Equip_Type` varchar(20) DEFAULT NULL,
  `Armor_Type` varchar(20) DEFAULT NULL,
  `Weapon_Type` varchar(20) DEFAULT NULL,
  `Set_Name` varchar(20) DEFAULT NULL,
  `Extra_Data` varchar(20) DEFAULT NULL,
  `Sales_Count` varchar(20) DEFAULT NULL,
  `Sales_Items` varchar(20) DEFAULT NULL,
  `Sales_Price` varchar(20) DEFAULT NULL,
  `Last_Sale_Time` varchar(20) DEFAULT NULL,
  `List_Count` varchar(20) DEFAULT NULL,
  `List_Items` varchar(20) DEFAULT NULL,
  `List_Price` varchar(20) DEFAULT NULL,
  `Last_List_Time` varchar(20) DEFAULT NULL,
  `Last_Seen_Time` varchar(20) DEFAULT NULL,
  `Good_Price` varchar(20) DEFAULT NULL,
  `Good_Sales_Price` varchar(20) DEFAULT NULL,
  `Good_List_Price` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `items_sets`
--

DROP TABLE IF EXISTS `items_sets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `items_sets` (
  `id` int(11) NOT NULL,
  `setName` text,
  `setMaxEquipCount` text,
  `setBonusCount` text,
  `itemCount` text,
  `setBonusDesc1` text,
  `setBonusDesc2` text,
  `setBonusDesc3` text,
  `setBonusDesc4` text,
  `setBonusDesc5` text,
  `setBonusDesc` text,
  `itemSlots` text,
  `representative` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  FULLTEXT KEY `setName` (`setName`,`setBonusDesc1`,`setBonusDesc2`,`setBonusDesc3`,`setBonusDesc4`,`setBonusDesc5`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `items_sets_bak`
--

DROP TABLE IF EXISTS `items_sets_bak`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `items_sets_bak` (
  `id` int(11) NOT NULL,
  `setName` text CHARACTER SET latin1,
  `setMaxEquipCount` text CHARACTER SET latin1,
  `setBonusCount` text CHARACTER SET latin1,
  `itemCount` text CHARACTER SET latin1,
  `setBonusDesc1` text CHARACTER SET latin1,
  `setBonusDesc2` text CHARACTER SET latin1,
  `setBonusDesc3` text CHARACTER SET latin1,
  `setBonusDesc4` text CHARACTER SET latin1,
  `setBonusDesc5` text CHARACTER SET latin1,
  `setBonusDesc` text CHARACTER SET latin1,
  `itemSlots` text CHARACTER SET latin1,
  `representative` varchar(20) CHARACTER SET latin1 DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `items_ttc`
--

DROP TABLE IF EXISTS `items_ttc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `items_ttc` (
  `id` int(20) DEFAULT NULL,
  `cat` int(20) DEFAULT NULL,
  `name` text COLLATE utf8mb4_unicode_ci,
  `language` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  KEY `id` (`id`),
  KEY `id_2` (`id`),
  KEY `id_3` (`id`),
  KEY `id_4` (`id`),
  KEY `id_5` (`id`),
  KEY `id_6` (`id`),
  KEY `id_7` (`id`),
  KEY `id_8` (`id`),
  KEY `id_9` (`id`),
  KEY `id_10` (`id`),
  KEY `id_11` (`id`),
  KEY `id_12` (`id`),
  KEY `id_13` (`id`),
  KEY `id_14` (`id`),
  KEY `id_15` (`id`),
  KEY `id_16` (`id`),
  KEY `id_17` (`id`),
  KEY `id_18` (`id`),
  KEY `id_19` (`id`),
  KEY `id_20` (`id`),
  KEY `id_21` (`id`),
  KEY `id_22` (`id`),
  KEY `id_23` (`id`),
  KEY `id_24` (`id`),
  KEY `id_25` (`id`),
  KEY `id_26` (`id`),
  KEY `id_27` (`id`),
  KEY `id_28` (`id`),
  KEY `id_29` (`id`),
  KEY `id_30` (`id`),
  KEY `id_31` (`id`),
  KEY `id_32` (`id`),
  FULLTEXT KEY `name` (`name`),
  FULLTEXT KEY `name_2` (`name`),
  FULLTEXT KEY `name_3` (`name`),
  FULLTEXT KEY `name_4` (`name`),
  FULLTEXT KEY `name_5` (`name`),
  FULLTEXT KEY `name_6` (`name`),
  FULLTEXT KEY `name_7` (`name`),
  FULLTEXT KEY `name_8` (`name`),
  FULLTEXT KEY `name_9` (`name`),
  FULLTEXT KEY `name_10` (`name`),
  FULLTEXT KEY `name_11` (`name`),
  FULLTEXT KEY `name_12` (`name`),
  FULLTEXT KEY `name_13` (`name`),
  FULLTEXT KEY `name_14` (`name`),
  FULLTEXT KEY `name_15` (`name`),
  FULLTEXT KEY `name_16` (`name`),
  FULLTEXT KEY `name_17` (`name`),
  FULLTEXT KEY `name_18` (`name`),
  FULLTEXT KEY `name_19` (`name`),
  FULLTEXT KEY `name_20` (`name`),
  FULLTEXT KEY `name_21` (`name`),
  FULLTEXT KEY `name_22` (`name`),
  FULLTEXT KEY `name_23` (`name`),
  FULLTEXT KEY `name_24` (`name`),
  FULLTEXT KEY `name_25` (`name`),
  FULLTEXT KEY `name_26` (`name`),
  FULLTEXT KEY `name_27` (`name`),
  FULLTEXT KEY `name_28` (`name`),
  FULLTEXT KEY `name_29` (`name`),
  FULLTEXT KEY `name_30` (`name`),
  FULLTEXT KEY `name_31` (`name`),
  FULLTEXT KEY `name_32` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `polls`
--

DROP TABLE IF EXISTS `polls`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `polls` (
  `channel` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guild` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id` int(20) NOT NULL AUTO_INCREMENT,
  `question` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(20) DEFAULT '1',
  `anonym` tinyint(20) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `active` (`active`),
  FULLTEXT KEY `guild` (`guild`,`channel`)
) ENGINE=InnoDB AUTO_INCREMENT=570 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `polls_answers`
--

DROP TABLE IF EXISTS `polls_answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `polls_answers` (
  `rowid` int(20) NOT NULL AUTO_INCREMENT,
  `id` int(20) NOT NULL,
  `answer` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `number` tinyint(20) NOT NULL,
  PRIMARY KEY (`rowid`)
) ENGINE=InnoDB AUTO_INCREMENT=1816 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `polls_votes`
--

DROP TABLE IF EXISTS `polls_votes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `polls_votes` (
  `rowid` int(20) NOT NULL AUTO_INCREMENT,
  `id` int(20) NOT NULL,
  `user` varchar(30) NOT NULL,
  `anonym` tinyint(20) DEFAULT '0',
  `vote` tinyint(20) NOT NULL,
  PRIMARY KEY (`rowid`),
  KEY `id` (`id`),
  FULLTEXT KEY `user` (`user`)
) ENGINE=InnoDB AUTO_INCREMENT=2825 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `servers`
--

DROP TABLE IF EXISTS `servers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `servers` (
  `id` varchar(20) NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` text,
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `stats`
--

DROP TABLE IF EXISTS `stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stats` (
  `id` varchar(200) DEFAULT NULL,
  `guild` text,
  `user` text,
  `command` text,
  `count` text,
  `options` text,
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vendors`
--

DROP TABLE IF EXISTS `vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vendors` (
  `dateid` int(11) DEFAULT NULL,
  `date` text,
  `item` text,
  `type` text
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `youtube`
--

DROP TABLE IF EXISTS `youtube`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `youtube` (
  `id` varchar(200) NOT NULL,
  `date` date DEFAULT NULL,
  `recommender` varchar(200) DEFAULT NULL,
  `youtuber` varchar(200) DEFAULT NULL,
  `title` text,
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-02-11 10:39:33
