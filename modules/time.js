const moment = require('moment-timezone');
require('datejs');
const mh = require("../helper/messages.js")
const zone = require("../helper/timezone.js");


module.exports = (bot, msg, options, Discord) => {
    var embed = mh.prepare(Discord)

    if (options.options == "-help" || options.others.length == 0) {
        embed.setTitle("Options for " + options.command)
        //embed.addField(options.command, "Shows timezone conversions")
        embed.addField(options.command + " EST", "Will show the current time for US EST")
        embed.addField(options.command + " 6am EST in UTC", "Converts a time from EST to UTC")
    } else {
        var search = options.others.pop();
        var dest = zone.searchZone(search);

        if (dest.length != 1) {
            embed.setTitle(options.command + "timezone conversion");
            var err = "";
            if (dest.length > 6)
                err = "Please be more specific";
            else if (dest.length > 1)
                err = dest.join(", ");
            else
                err = "Try being a little more generic";

            embed.addField("Found " + dest.length + " timezones" + (search.length == 0 ? "" : " for '" + search + "'"), err);

            mh.send(msg, embed, options);
            return; // TODO: Error
        }

        if (options.others.length == 0) {
            // Single conversion
            let tz = moment().tz(dest[0]);
            embed.addField("Time in " + tz.zoneName(), "It is currently " + tz.format('h:mm a z'));
        }
        else {
            var query = options.others.join(" ");
            search = options.others.pop();
            var src = zone.searchZone(search);
            if (src.length == 0 && options.others.length > 0) {
                search = options.others.pop();
                src = zone.searchZone(search);    // Assume that the word was a 'joiner' (ie, 'to' 'in' etc)
            }

            if (src.length != 1 && options.timezone.length > 0) {
                // Ignore both non-match and multiple matches and prefer fallback to 'option' timezone
                search = '';
                options.others = [query];
                src = dest;
                dest = [options.timezone];
            }

            // Could probably do other smarts here too, eg detect a 'hh:mmZ-00:00' or equivalent

            if (src.length != 1) {
                embed.setTitle(options.command + "timezone conversion");
                var err = "";
                if (src.length > 6)
                    err = "Please be more specific";
                else if (src.length > 1)
                    err = src.join(", ");
                else
                    err = "Try being a little more generic";
                
                embed.addField("Found " + src.length + " timezones" + (search.length == 0 ? "" : " for '" + search + "'"), err);

                mh.send(msg, embed, options);
                return;
            }

            query = options.others.join(" ");
            var parsed = Date.parse(query);
            if (parsed != null) {
                var tz = moment.tz(parsed.toString("yyyy-MM-ddTHH:mm:ss"), src[0]);
                embed.addField("Conversion to " + dest[0], tz.format("ddd h:mm a z") + " converts to " + tz.tz(dest[0]).format("ddd h:mm a z"));
            }
            else
                return;
        }

    }

    mh.send(msg, embed, options)

};
