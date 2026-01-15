const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "pok",
    aliases: ["aiimage", "genimg"],
    version: "1.0",
    author: "Mostakim",
    role: 0,
    shortDescription: "Generate AI image using Mahabub Imagine API",
    category: "ai",
    guide: {
      en: "{p}imagine <prompt>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage("⚠️ Please provide a prompt.\nExample: imagine a dog playing guitar", event.threadID, event.messageID);
    }

    const apiUrl = `https://mahabub-imaginev2.vercel.app/api/gen?mahabub=${encodeURIComponent(prompt)}`;
    const imgPath = path.join(__dirname, "cache", `imagine_${Date.now()}.jpg`);

    try {
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, Buffer.from(response.data, "binary"));

      api.sendMessage(
        {
          body: `🪄 Generated Image for: ${prompt}`,
          attachment: fs.createReadStream(imgPath)
        },
        event.threadID,
        () => fs.unlinkSync(imgPath)
      );
    } catch (error) {
      api.sendMessage("❌ Failed to generate image. Please try again later.", event.threadID, event.messageID);
      console.error(error);
    }
  }
};