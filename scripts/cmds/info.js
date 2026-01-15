const axios = require('axios');
const moment = require('moment-timezone');

module.exports = {
    config: {
        name: "info",
        aliases: ["inf", "in4"],
        version: "2.6",
        author: "MR᭄﹅ MAHABUB﹅ メꪜ",
        countDown: 5,
        role: 0,
        shortDescription: { en: "Sends bot and admin info." },
        longDescription: { en: "Sends bot and admin info along with a random video from the API." },
        category: "Information",
        guide: { en: "{pn}" }
    },

    onStart: async function ({ message }) {
        this.sendInfo(message);
    },

    onChat: async function ({ event, message }) {
        if (event.body && event.body.trim().toLowerCase() === "info") {
            this.sendInfo(message);
        }
    },

    sendInfo: async function (message) {
        message.reply("𝑾𝒂𝒊𝒕 𝒃𝒂𝒃𝒚... 𝑳𝒐𝒂𝒅𝒊𝒏𝒈 𝒂𝒖𝒕𝒉𝒐𝒓 𝒊𝒏𝒇𝒐 😘").then(async (waitMsg) => {
            setTimeout(() => {
                message.unsend(waitMsg.messageID);
            }, 4000);

            const botName = "𝑴𝑨𝑯𝑨𝑩𝑼𝑩-𝑩𝑶𝑻";
            const botPrefix = `${global.GoatBot.config.prefix}`;
            const authorName = "𝑴𝑨𝑯𝑨𝑩𝑼𝑩 𝑹𝑨𝑯𝑴𝑨𝑵";
            const authorFB = "https://www.facebook.com/www.xnxx.com140";
            const authorInsta = "@mahabub_rahman_404";
            const status = "𝑺𝑰𝑵𝑮𝑳𝑬..!";

            const now = moment().tz('Asia/Dhaka');
            const date = now.format('dddd, MMMM Do YYYY');
            const time = now.format('h:mm:ss A');

            const uptime = process.uptime();
            const seconds = Math.floor(uptime % 60);
            const minutes = Math.floor((uptime / 60) % 60);
            const hours = Math.floor((uptime / (60 * 60)) % 24);
            const days = Math.floor(uptime / (60 * 60 * 24));
            const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`.replace(/^0d 0h /, "");

            try {
                const videoResponse = await axios.get("https://mahabub-apis.vercel.app/info");
                if (!videoResponse.data || !videoResponse.data.data) {
                    throw new Error("Invalid video API response.");
                }

                let videoUrl = videoResponse.data.data;

                if (videoUrl.includes("drive.google.com")) {
                    const match = videoUrl.match(/[-\w]{25,}/);
                    if (match) {
                        videoUrl = `https://drive.google.com/uc?id=${match[0]}`;
                    }
                }

                message.reply({
                    body:
`╭─╼━━━[ 🌟 𝑩𝑶𝑻 & 𝑨𝑼𝑻𝑯𝑶𝑹 𝑰𝑵𝑭𝑶 🌟 ]━━━╾─╮
┃
┃ 👤 𝑶𝒘𝒏𝒆𝒓: ${authorName}
┃ 🤖 𝑩𝒐𝒕 𝑵𝒂𝒎𝒆: ${botName}
┃ 🔰 𝑷𝒓𝒆𝒇𝒊𝒙: ${botPrefix}
┃ ❤ 𝑹𝒆𝒍𝒂𝒕𝒊𝒐𝒏: ${status}
┃
┃ 📆 𝑫𝒂𝒕𝒆: ${date}
┃ ⏰ 𝑻𝒊𝒎𝒆: ${time}
┃ ⚙ 𝑼𝒑𝒕𝒊𝒎𝒆: ${uptimeString}
┃
┃ 🌐 𝑭𝒂𝒄𝒆𝒃𝒐𝒐𝒌: ${authorFB}
┃ 📸 𝑰𝒏𝒔𝒕𝒂: ${authorInsta}
┃
╰─╼━━━━━━━━━━━━━━━━━━━━━━━━━━━━╾─╯`,
                    attachment: await global.utils.getStreamFromURL(videoUrl)
                });

            } catch (error) {
                console.error("Error fetching video:", error);
                message.reply("❌ 𝑬𝒓𝒓𝒐𝒓 𝒇𝒆𝒕𝒄𝒉𝒊𝒏𝒈 𝒗𝒊𝒅𝒆𝒐. 𝑷𝒍𝒆𝒂𝒔𝒆 𝒕𝒓𝒚 𝒂𝒈𝒂𝒊𝒏 𝒍𝒂𝒕𝒆𝒓.");
            }
        });
    }
};