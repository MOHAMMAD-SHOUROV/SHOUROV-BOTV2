const { getTime } = global.utils;
const { createCanvas, loadImage, registerFont } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ---------- cache paths ----------
const cacheDir = path.join(__dirname, "cache");
const fontPath = path.join(cacheDir, "ModernoirBold.ttf");

// ---------- preload font safely ----------
async function ensureFont() {
  try {
    await fs.ensureDir(cacheDir);
    if (!fs.existsSync(fontPath)) {
      console.log("⏬ Downloading welcome font...");
      const url =
        "https://github.com/MR-MAHABUB-004/MAHABUB-BOT-STORAGE/raw/main/fronts/tt-modernoir-trial.bold.ttf";
      const { data } = await axios.get(url, { responseType: "arraybuffer" });
      await fs.writeFile(fontPath, data);
    }
    registerFont(fontPath, { family: "ModernoirBold" });
  } catch (e) {
    console.error("❌ Font load failed:", e.message);
  }
}

module.exports = {
  config: {
    name: "welcome",
    version: "4.1-fixed",
    author: "MR MAHABUB | fixed by Alihsan Shourov",
    category: "events"
  },

  onStart: async ({ threadsData, message, event, api }) => {
    try {
      if (event.logMessageType !== "log:subscribe") return;

      await ensureFont();

      const { threadID, logMessageData } = event;
      const added = logMessageData.addedParticipants?.[0];
      if (!added) return;

      const threadInfo = await api.getThreadInfo(threadID);
      const threadName = threadInfo.threadName || "Group";
      const memberCount = threadInfo.participantIDs.length;

      const userName = added.fullName;
      const userID = added.userFbId;

      // avatar (NO TOKEN)
      const avatarUrl = `https://graph.facebook.com/${userID}/picture?width=512&height=512`;

      // background
      const bgUrl = "https://files.catbox.moe/cj68oa.jpg";

      // canvas
      const canvas = createCanvas(1000, 500);
      const ctx = canvas.getContext("2d");

      const bg = await loadImage(
        (await axios.get(bgUrl, { responseType: "arraybuffer" })).data
      );
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      const avatarImg = await loadImage(
        (await axios.get(avatarUrl, { responseType: "arraybuffer" })).data
      );

      // circle avatar
      ctx.save();
      ctx.beginPath();
      ctx.arc(500, 160, 80, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatarImg, 420, 80, 160, 160);
      ctx.restore();

      // text
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 42px ModernoirBold";
      ctx.fillText(userName, 500, 300);

      ctx.font = "bold 30px ModernoirBold";
      ctx.fillStyle = "#00ffcc";
      ctx.fillText(`Welcome to ${threadName}`, 500, 350);

      ctx.font = "bold 24px ModernoirBold";
      ctx.fillStyle = "#ffea00";
      ctx.fillText(`You are member #${memberCount}`, 500, 395);

      // save
      const outPath = path.join(cacheDir, `welcome_${userID}.png`);
      await fs.writeFile(outPath, canvas.toBuffer("image/png"));

      await message.send(
        {
          body: `🎉 Welcome ${userName} to ${threadName}!`,
          attachment: fs.createReadStream(outPath)
        },
        () => fs.unlinkSync(outPath)
      );
    } catch (err) {
      console.error("❌ Welcome event error:", err && err.message);
    }
  }
};