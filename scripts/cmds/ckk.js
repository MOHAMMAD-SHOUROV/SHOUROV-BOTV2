const axios = require("axios");

module.exports = {
  config: {
    name: "ckk",
    aliases: [],
    version: "1.0",
    author: "Mahabub",
    countDown: 5,
    role: 0,
    shortDescription: "Check a URL response",
    longDescription: "Fetch and show any URL response (text/json/html)",
    category: "Utility",
    guide: {
      en: "{p}ck <url>"
    }
  },

  onStart: async function({ message, args }) {
    const url = args[0];
    if (!url) {
      return message.reply("⚠️ অনুগ্রহ করে একটি URL দিন!\n\nউদাহরণ: ck https://example.com");
    }

    try {
      // Fetch URL
      const res = await axios.get(url, { timeout: 10000 });

      // Convert JSON to readable text (if applicable)
      let data;
      if (typeof res.data === "object") {
        data = JSON.stringify(res.data, null, 2);
      } else {
        data = res.data.toString();
      }

      // Limit response size (Messenger message limit)
      if (data.length > 20000) {
        data = data.slice(0, 20000) + "\n\n⚠️ Response truncated (too long)";
      }

      message.reply(`✅ **URL:** ${url}\n━━━━━━━━━━━━━━━\n${data}`);
    } catch (err) {
      message.reply(`❌ Error fetching URL:\n${err.message}`);
    }
  }
};
