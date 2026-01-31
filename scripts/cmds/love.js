const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const Jimp = require("jimp");

module.exports = {
  config: {
    name: "love",
    version: "8.0.0",
    author: "CYBER BOT TEAM (Fixed by Shourov)",
    role: 0,
    category: "img",
    shortDescription: {
      en: "Love pair image (mention / reply / random)"
    },
    guide: {
      en: "{pn} @mention | reply | random"
    }
  },

  onStart: async function ({ event, message, api }) {
    const { senderID, mentions, messageReply, body, threadID } = event;

    let targetID = null;

    // ✅ 1️⃣ Mention
    if (mentions && Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    }

    // ✅ 2️⃣ Reply
    else if (messageReply && messageReply.senderID) {
      targetID = messageReply.senderID;
    }

    // ✅ 3️⃣ Name detect (stylish হলেও)
    else if (body) {
      const threadInfo = await api.getThreadInfo(threadID);
      const text = body.toLowerCase();

      const found = threadInfo.userInfo.find(u =>
        u.name && text.includes(u.name.toLowerCase())
      );

      if (found) targetID = found.id;
    }

    // ✅ 4️⃣ RANDOM user (fallback)
    if (!targetID) {
      const threadInfo = await api.getThreadInfo(threadID);
      const members = threadInfo.participantIDs.filter(id => id !== senderID);
      targetID = members[Math.floor(Math.random() * members.length)];
    }

    const one = senderID;
    const two = targetID;

    const captions = [
      "💖 তুমি আমার চোখেতে সরলতার উপমা 🩷🐰",
      "💖 প্রিয়… তোমার মাঝেই সব সুখ খুঁজে পাই 🥺❤️",
      "বিচ্ছেদের পরেও যোগাযোগ রাখার নামই মায়া 💖",
      "মানুষ চলে যায়, স্মৃতি থেকে যায় 💔",
      "ভালোবাসা মানে এমন একজন — যার হাসিতে সকাল শুরু হয় 💖",
      "চোখের ভাষা বোঝে যে, সে-ই প্রিয় মানুষ 💞",
      "তুমি একটা মিষ্টি অভ্যাস — ছাড়াও বাঁচা যায় না 💖"
    ];

    const caption = captions[Math.floor(Math.random() * captions.length)];

    try {
      const imgPath = await makeImage(one, two);

      await message.reply({
        body: caption,
        attachment: fs.createReadStream(imgPath)
      });

      fs.unlinkSync(imgPath);

    } catch (err) {
      console.log(err);
      return message.reply("❌ Image generate failed!");
    }
  }
};

/* ================= IMAGE MAKER ================= */

async function makeImage(one, two) {
  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

  const bgPath = path.join(cacheDir, "love_bg.png");

  if (!fs.existsSync(bgPath)) {
    const bg = await axios.get("https://i.imgur.com/iaOiAXe.jpeg", {
      responseType: "arraybuffer"
    });
    fs.writeFileSync(bgPath, bg.data);
  }

  const avatar1 = path.join(cacheDir, `avt_${one}.png`);
  const avatar2 = path.join(cacheDir, `avt_${two}.png`);
  const outPath = path.join(cacheDir, `love_${one}_${two}.png`);

  const av1 = await axios.get(
    `https://graph.facebook.com/${one}/picture?width=512&height=512`,
    { responseType: "arraybuffer" }
  );
  const av2 = await axios.get(
    `https://graph.facebook.com/${two}/picture?width=512&height=512`,
    { responseType: "arraybuffer" }
  );

  fs.writeFileSync(avatar1, av1.data);
  fs.writeFileSync(avatar2, av2.data);

  const bgImg = await Jimp.read(bgPath);
  const c1 = await circle(avatar1);
  const c2 = await circle(avatar2);

  bgImg
    .composite(c1.resize(200, 200), 70, 110)
    .composite(c2.resize(200, 200), 465, 110);

  await bgImg.writeAsync(outPath);

  fs.unlinkSync(avatar1);
  fs.unlinkSync(avatar2);

  return outPath;
}

async function circle(imgPath) {
  const img = await Jimp.read(imgPath);
  img.circle();
  return img;
}