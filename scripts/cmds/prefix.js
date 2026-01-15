!cmd install prefix.js const axios = require("axios");
const fs = require("fs");
const path = require("path");
const utils = global.utils;

module.exports = {
    config: {
        name: "Prefix",
        version: "1.7",
        prefix: false,
        author: "MR᭄﹅ MAHABUB﹅ メꪜ",
        countDown: 5,
        role: 0,
        description: "Change the bot's command prefix",
        category: "config",
    },

    langs: {
        en: {
            reset: "Your prefix has been reset to default: %1",
            onlyAdmin: "Only admin can change the system bot prefix",
            confirmGlobal: "React to confirm changing the system prefix",
            confirmThisThread: "React to confirm changing the prefix in this chat",
            successGlobal: "Changed system bot prefix to: %1",
            successThisThread: "Changed prefix in this chat to: %1",
            myPrefix:
                "\n\n‣ 𝐆𝐥𝐨𝐛𝐚𝐥 𝐩𝐫𝐞𝐟𝐢𝐱: %1" +
                "\n\n‣ 𝐘𝐨𝐮𝐫 𝐠𝐫𝐨𝐮𝐩 𝐩𝐫𝐞𝐟𝐢𝐱: %2" +
                "\n\n‣ 𝐀𝐝𝐦𝐢𝐧" +
                "\n\n‣ MR᭄﹅ MAHABUB﹅ メꪜ" +
                "\n\n‣ 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 ⓕ" +
                "\n‣ https://facebook.com/www.xnxx.com140\n"
        }
    },

    // ================= START COMMAND =================
    onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {

        if (!args[0])
            return message.reply("Please provide a new prefix or use `reset`");

        if (args[0] === "reset") {
            await threadsData.set(event.threadID, null, "data.prefix");
            return message.reply(getLang("reset", global.GoatBot.config.prefix));
        }

        const newPrefix = args[0];
        if (newPrefix.length < 1 || newPrefix.length > 5)
            return message.reply("Prefix must be 1–5 characters");

        const formSet = {
            commandName,
            author: event.senderID,
            newPrefix
        };

        if (args[1] === "-g") {
            if (role < 2) return message.reply(getLang("onlyAdmin"));
            formSet.setGlobal = true;
        } else {
            formSet.setGlobal = false;
        }

        return message.reply(
            args[1] === "-g" ? getLang("confirmGlobal") : getLang("confirmThisThread"),
            (err, info) => {
                formSet.messageID = info.messageID;
                global.GoatBot.onReaction.set(info.messageID, formSet);

                setTimeout(() => {
                    global.GoatBot.onReaction.delete(info.messageID);
                }, 60000);
            }
        );
    },

    // ================= PREFIX INFO + VIDEO =================
    onChat: async function ({ event, message, getLang }) {

        if (!event.body || event.body.toLowerCase() !== "prefix") return;

        try {
            // API must return DIRECT MP4 URL
            const res = await axios.get("https://mahabub-apis.vercel.app/prefix");
            const videoUrl = res.data?.data;

            if (!videoUrl)
                return message.reply("❌ Video link not found");

            const cacheDir = path.join(__dirname, "cache");
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

            const filePath = path.join(cacheDir, "prefix.mp4");

            // download video
            const video = await axios({
                method: "GET",
                url: videoUrl,
                responseType: "stream"
            });

            const writer = fs.createWriteStream(filePath);
            video.data.pipe(writer);

            writer.on("finish", async () => {
                await message.reply({
                    body: getLang(
                        "myPrefix",
                        global.GoatBot.config.prefix,
                        utils.getPrefix(event.threadID)
                    ),
                    attachment: fs.createReadStream(filePath)
                });

                fs.unlinkSync(filePath); // delete after send
            });

            writer.on("error", () => {
                message.reply("❌ Failed to download video");
            });

        } catch (err) {
            console.error(err);
            message.reply("❌ Error while sending prefix video");
        }
    },

    // ================= REACTION CONFIRM =================
    onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {

        const { author, newPrefix, setGlobal } = Reaction;
        if (event.userID !== author) return;

        if (setGlobal) {
            global.GoatBot.config.prefix = newPrefix;
            fs.writeFileSync(
                global.client.dirConfig,
                JSON.stringify(global.GoatBot.config, null, 2)
            );
            return message.reply(getLang("successGlobal", newPrefix));
        } else {
            await threadsData.set(event.threadID, newPrefix, "data.prefix");
            return message.reply(getLang("successThisThread", newPrefix));
        }
    }
};
