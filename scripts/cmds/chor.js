const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "chor",
    version: "2.0.0",
    author: "Alihsan Shourov",
    role: 0,
    category: "fun",
    shortDescription: {
      en: "Scooby-doo chor meme"
    },
    guide: {
      en: "{pn} @mention | reply"
    }
  },

  onStart: async function ({ event, message }) {
    const { senderID, mentions, messageReply } = event;

    let targetID;

    if (mentions && Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply?.senderID) {
      targetID = messageReply.senderID;
    }

    if (!targetID) {
      return message.reply("❌ Please reply or mention someone.");
    }

    try {
      const apiList = await axios.get(
        "https://raw.githubusercontent.com/shahadat-sahu/SAHU-API/refs/heads/main/SAHU-API.json"
      );

      const AVATAR_CANVAS_API = apiList.data.AvatarCanvas;

      const res = await axios.post(
        `${AVATAR_CANVAS_API}/api`,
        {
          cmd: "chor",
          senderID: targetID,
          targetID: senderID
        },
        {
          responseType: "arraybuffer",
          timeout: 30000
        }
      );

      const cachePath = path.join(__dirname, "cache");
      if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);

      const imgPath = path.join(cachePath, `chor_${senderID}_${targetID}.png`);
      fs.writeFileSync(imgPath, res.data);

      await message.reply({
        body: "😹 বলদ মেয়েদের চিপায় ধরা খাইছে 🤣",
        attachment: fs.createReadStream(imgPath)
      });

      fs.unlinkSync(imgPath);

    } catch (e) {
      return message.reply("❌ API Error!.");
    }
  }
};