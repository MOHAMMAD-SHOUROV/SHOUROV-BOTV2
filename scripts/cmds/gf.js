const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "gf",
    version: "1.4",
    author: "shourov",
    countDown: 5,
    role: 0,
    shortDescription: "Send GF pic with title",
    longDescription: "Sends a GF image with message and author from API or keywords like 'gf de'",
    category: "fun",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    return sendGf(api, event);
  },

  onChat: async function ({ event, api }) {
    const message = event.body?.toLowerCase();
    if (!message) return;

    const triggerWords = ["gf", "gf de", "bot gf de"];
    if (triggerWords.includes(message.trim())) {
      return sendGf(api, event);
    }
  }
};

async function sendGf(api, event) {
  try {
    const res = await axios.get("https://shourov-bot-gf-api.onrender.com/shourovGF");
    const { title, url } = res.data.data;
    const authorName = res.data.author.name;

    const fullMessage = `❥┈•${title}\n\nAuthor: ${authorName}....`;

    const imgPath = path.join(__dirname, "cache", `gf.jpg`);
    const imgRes = await axios.get(url, { responseType: "arraybuffer" });
    fs.writeFileSync(imgPath, Buffer.from(imgRes.data, "binary"));

    api.sendMessage({
      body: fullMessage,
      attachment: fs.createReadStream(imgPath)
    }, event.threadID, () => fs.unlinkSync(imgPath), event.messageID);

  } catch (err) {
    console.error(err);
    api.sendMessage("error fetching data.", event.threadID, event.messageID);
  }
}
