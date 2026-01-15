 const { writeFileSync } = require("fs-extra");
const { config } = global.GoatBot;
const { client } = global;

module.exports = {
    config: {
        name: "whitelists",
        aliases: ["wlonly", "onlywlst", "onlywhitelist", "wl"],
        version: "1.5",
        author: "Chitron Bhattacharjee",
        countDown: 5,
        role: 0,
        description: { en: "Add, remove, edit whiteListIds role" },
        category: "owner",
        guide: {
            en:
                " {pn} [add | -a] <uid | @tag>: Add whiteListIds role for user" +
                "\n {pn} [remove | -r] <uid | @tag>: Remove whiteListIds role of user" +
                "\n {pn} [list | -l]: List all whiteListIds" +
                "\n {pn} -m [on | off]: turn on/off only whitelist mode" +
                "\n {pn} -m noti [on | off]: turn on/off notification when non-whitelist user uses bot",
        },
    },

    langs: {
        en: {
            added: `╭✦✅ | Added %1 user(s)\n%2`,
            alreadyAdded: `╭✦⚠️ | Already added %1 user(s)\n%2`,
            missingIdAdd: "⚠️ | Please enter UID to add whitelist role",
            removed: `╭✦✅ | Removed %1 user(s)\n%2`,
            notAdded: `╭✦⚠️ | Didn't add %1 user(s)\n%2`,
            missingIdRemove: "⚠️ | Please enter UID to remove whitelist role",
            listAdmin: `╭✦✨ | List of UserIDs\n%1\n╰‣`,
            turnedOn: "✅ | Whitelist-only mode turned ON",
            turnedOff: "❎ | Whitelist-only mode turned OFF",
            turnedOnNoti: "✅ | Notification for non-whitelist users turned ON",
            turnedOffNoti: "❎ | Notification for non-whitelist users turned OFF",
        },
    },

    onStart: async function ({ message, args, usersData, event, getLang, api }) {
        const permission = global.GoatBot.config.adminBot;
        if (!permission.includes(event.senderID)) {
            return api.sendMessage("You don't have permission to use this command.", event.threadID, event.messageID);
        }

        const cmd = args[0]?.toLowerCase();

        switch (cmd) {
            // ===== ADD WHITELIST =====
            case "add":
            case "-a": {
                let uids = [];
                if (Object.keys(event.mentions).length > 0) uids = Object.keys(event.mentions);
                else if (event.messageReply) uids = [event.messageReply.senderID];
                else uids = args.slice(1).filter(arg => !isNaN(arg));

                if (uids.length === 0) return message.reply(getLang("missingIdAdd"));

                const added = [];
                const already = [];

                for (const uid of uids) {
                    if (config.whiteListMode.whiteListIds.includes(uid)) already.push(uid);
                    else {
                        config.whiteListMode.whiteListIds.push(uid);
                        added.push(uid);
                    }
                }

                const getNames = await Promise.all(
                    uids.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
                );

                writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));

                return message.reply(
                    (added.length
                        ? getLang(
                              "added",
                              added.length,
                              getNames
                                  .filter(u => added.includes(u.uid))
                                  .map(u => `├‣ NAME: ${u.name}\n├‣ UID: ${u.uid}`)
                                  .join("\n")
                          )
                        : "") +
                        (already.length
                            ? getLang("alreadyAdded", already.length, already.map(uid => `├‣ UID: ${uid}`).join("\n"))
                            : "")
                );
            }

            // ===== REMOVE WHITELIST =====
            case "remove":
            case "-r": {
                let uids = [];
                if (Object.keys(event.mentions).length > 0) uids = Object.keys(event.mentions);
                else if (event.messageReply) uids = [event.messageReply.senderID];
                else uids = args.slice(1).filter(arg => !isNaN(arg));

                if (uids.length === 0) return message.reply(getLang("missingIdRemove"));

                const removed = [];
                const notAdded = [];

                for (const uid of uids) {
                    if (config.whiteListMode.whiteListIds.includes(uid)) {
                        config.whiteListMode.whiteListIds.splice(config.whiteListMode.whiteListIds.indexOf(uid), 1);
                        removed.push(uid);
                    } else notAdded.push(uid);
                }

                const getNames = await Promise.all(
                    uids.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
                );

                writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));

                return message.reply(
                    (removed.length
                        ? getLang(
                              "removed",
                              removed.length,
                              getNames
                                  .filter(u => removed.includes(u.uid))
                                  .map(u => `├‣ NAME: ${u.name}\n├‣ UID: ${u.uid}`)
                                  .join("\n")
                          )
                        : "") +
                        (notAdded.length
                            ? getLang("notAdded", notAdded.length, notAdded.map(uid => `├‣ UID: ${uid}`).join("\n"))
                            : "")
                );
            }

            // ===== LIST WHITELIST =====
            case "list":
            case "-l": {
                const getNames = await Promise.all(
                    config.whiteListMode.whiteListIds.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
                );
                return message.reply(
                    getLang(
                        "listAdmin",
                        getNames
                            .map(({ uid, name }) => `├‣ NAME: ${name}\n├‣ UID: ${uid}`)
                            .join("\n")
                    )
                );
            }

            // ===== MODE ON/OFF =====
            case "m":
            case "mode":
            case "-m": {
                let isSetNoti = false;
                let value;
                let indexGetVal = 1;

                if (args[1]?.toLowerCase() === "noti") {
                    isSetNoti = true;
                    indexGetVal = 2;
                }

                if (args[indexGetVal]?.toLowerCase() === "on") value = true;
                else if (args[indexGetVal]?.toLowerCase() === "off") value = false;
                else return message.reply("Please provide 'on' or 'off'");

                if (isSetNoti) {
                    config.hideNotiMessage.whiteListMode = !value;
                    message.reply(getLang(value ? "turnedOnNoti" : "turnedOffNoti"));
                } else {
                    config.whiteListMode.enable = value;
                    message.reply(getLang(value ? "turnedOn" : "turnedOff"));
                }

                writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
                break;
            }

            default:
                return message.reply("Invalid command. Use add/remove/list/mode.");
        }
    },
};
