module.exports = (bot, msg, setitems) => {
    msg.channel.sendMessage("Available options:");
    msg.channel.sendMessage(" **!golden** -> Golden Vendor Items");
    msg.channel.sendMessage(" **!pledges** -> Today's Pledges");
    msg.channel.sendMessage(" **!status** -> ESO Server Status");
    msg.channel.sendMessage(" **!set XXXX** -> Set item information (e.g. !set skel)" );
    msg.channel.sendMessage(" **!twitch** -> Current top 5 ESO streams" );

};