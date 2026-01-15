const moment = require('moment-timezone');
const axios = require('axios');
const fs = require('fs');

module.exports = {
  config: {
    name: "datetime",
    aliases: ["date", "time"],
    version: "1.6",
    author: "kae",
    countdown: 5,
    role: 0,
    shortDescription: "Displays the current date and time in Dhaka, Bangladesh.",
    longDescription: "This command provides the current date and time in Dhaka, Bangladesh along with a random image.",
    category: "misc",
    guide: "{prefix}{name}",
    envConfig: {}
  },

  onStart: async function ({ message }) {
    try {
      const timezone = "Asia/Dhaka";
      const now = moment().tz(timezone);

      const reply = `📅 **Date & Time in Dhaka, Bangladesh**\n` +
        `❏ **Date:** ${now.format("dddd, DD MMMM YYYY")}\n` +
        `❏ **Time:** ${now.format("h:mm:ss A")} (UTC+6)\n` +
        `❏ **Author:** 𝐀𝐥𝐈𝐇𝐒𝐀𝐍 𝐒𝐇𝐎𝐔𝐑𝐎𝐕`;

      const imageUrls = [
        "https://drive.google.com/uc?export=download&id=1IwnpXVzcxY9s5HK-Nys2Sy4LhJLdNs3i",
        "https://drive.google.com/uc?export=download&id=1MWaaJwDKT6C5gPjkDYVDMnbaHRXg0-ke",
        "https://drive.google.com/uc?export=download&id=1IpIqRVaBV1UpWSUSUgK57VrBZWt--vR2"
      ];

      const randomImage = imageUrls[Math.floor(Math.random() * imageUrls.length)];
      const imagePath = `${__dirname}/dhaka-time.jpg`;

      const response = await axios.get(randomImage, { responseType: "arraybuffer" });
      fs.writeFileSync(imagePath, response.data);

      message.reply({
        body: reply,
        attachment: fs.createReadStream(imagePath)
      }, () => {
        fs.unlinkSync(imagePath);
      });

    } catch (error) {
      console.error("Error retrieving date and time:", error);
      message.reply("⚠️ An error occurred while retrieving the date and time.");
    }
  },

  onEvent: async function () {}
};
