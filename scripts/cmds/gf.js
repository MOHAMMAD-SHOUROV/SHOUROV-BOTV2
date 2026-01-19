const axios = require("axios");

module.exports = {
  config: {
    name: "gf",
    aliases: ["gf de", "bot gf de", "gf dao"],
    version: "1.0",
    author: "SHOUROV",
    role: 0,
    category: "fun",
    shortDescription: "Random GF",
    longDescription: "Get a random GF",
    guide: "{pn}"
  },

  onStart: async function ({ message, event }) {
    try {
      const res = await axios.get(
        "https://shourov-bot-gf-api.onrender.com/shourovGF"
      );

      const data = res.data.data;
      const images = res.data.images;

      if (!Array.isArray(data) || data.length === 0) {
        return message.reply("❌ GF পাওয়া যায়নি");
      }

      const randomText =
        data[Math.floor(Math.random() * data.length)];

      const randomImg =
        images[Math.floor(Math.random() * images.length)];

      return message.reply({
        body: `${randomText.title}\n\n${randomText.fb}`,
        attachment: await global.utils.getStreamFromURL(randomImg)
      });

    } catch (e) {
      console.log("GF ERROR:", e.message);
      return message.reply("⚠️ GF আনতে সমস্যা হয়েছে");
    }
  }
};