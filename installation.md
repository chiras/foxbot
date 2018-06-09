## Requirements

* Node.js/NPM
* mysql for mysql support (a lot of commands need it, but not required for development)

## Basic installation

1) getting the code:

```sh
git clone https://github.com/chiras/foxbot.git
cd foxbot
```

2) installing dependencies of npm modules
```sh
npm install
```

3) filling out the token file

I use a dev and a live version of the bot, you can change that of course. Fill out a .json file with API keys that you got from other services:

* Youtube
* Twitch
* ...

Make sure this file is pointed to with the bot you later start up

## without mysql

[TODO]

## with mysql

Install Mysql and login to it

```sql
CREATE DATABASE foxbot;
```

Back to the commmand line:
```sh
mysql -u root -p foxbot < mysql_schema.sql
```

Create a new user then and grant all provileges or just use the root, however you like. Put your credentials into the token file you use.


## starting the bot

###
currently the main version is run sharded, thus the script points to that version, see "sharding below". It is not recommended with below 2.500 guilds, though.

Make sure the ```startup_foxbot.sh``` points to ```foxbot.js```!

### sharding
If your bot is active in more than 2.500 guilds, it must be sharded.
Make sure the ```startup_foxbot.sh``` points to ```foxbot-sharded.js```!

### starting

This script will make sure that the bot respawns after crashes.

```sh
./startup_foxbot.sh
```
