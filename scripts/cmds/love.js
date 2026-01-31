const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const Jimp = require("jimp");

module.exports = {
  config: {
    name: "love",
    version: "8.1.0",
    author: "CYBER BOT TEAM (Stable Fix by Shourov)",
    role: 0,
    category: "img",
    shortDescription: { en: "Love pair image (mention / reply / random)" },
    guide: { en: "{pn} @mention | reply | random" }
  },

  onStart: async function ({ event, message, api }) {
    try {
      const { senderID, mentions, messageReply, threadID } = event;
      let targetID;

      // mention
      if (mentions && Object.keys(mentions).length > 0) {
        targetID = Object.keys(mentions)[0];
      }
      // reply
      else if (messageReply) {
        targetID = messageReply.senderID;
      }
      // random
      else {
        const info = await api.getThreadInfo(threadID);
        const members = info.participantIDs.filter(i => i !== senderID);
        targetID = members[Math.floor(Math.random() * members.length)];
      }

      const captions = [
        "💖 তুমি আমার চোখেতে সরলতার উপমা 🩷🐰",
        "ভালোবাসা মানে — তোমার হাসি 💖",
        "মানুষ চলে যায়, স্মৃতি থেকে যায় 💔",
        "তুমি একটা মিষ্টি অভ্যাস 💞",
        "ভালোবাসা শব্দে নয়, অনুভবে 💖"
      ];

      const caption = captions[Math.floor(Math.random() * captions.length)];

      const img = await makeImage(senderID, targetID);
      await message.reply({
        body: caption,
        attachment: fs.createReadStream(img)
      });

      fs.unlinkSync(img);

    } catch (err) {
      console.log("LOVE CMD ERROR:", err);
      return message.reply("❌ Image generate failed (check console)");
    }
  }
};

/* ================= IMAGE ================= */

async function makeImage(one, two) {
  const cache = path.join(__dirname, "cache");
  if (!fs.existsSync(cache)) fs.mkdirSync(cache, { recursive: true });

  const bgPath = path.join(cache, "bg.png");
  const out = path.join(cache, `love_${Date.now()}.png`);

  // background
  if (!fs.existsSync(bgPath)) {
    const bg = await axios.get("https://i.imgur.com/iaOiAXe.jpeg", {
      responseType: "arraybuffer"
    });
    fs.writeFileSync(bgPath, bg.data);
  }

  // avatar (NO FACEBOOK API)
  const av1 = await Jimp.read(`https://ui-avatars.com/api/?name=${one}&size=512`);
  const av2 = await Jimp.read(`https://ui-avatars.com/api/?name=${two}&size=512`);

  av1.circle().resize(200, 200);
  av2.circle().resize(200, 200);

  const bg = await Jimp.read(bgPath);
  bg.composite(av1, 70, 110);
  bg.composite(av2, 465, 110);

  await bg.writeAsync(out);
  return out;
}