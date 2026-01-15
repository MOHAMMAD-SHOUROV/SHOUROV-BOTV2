const { getTime } = global.utils;
const { createCanvas, loadImage, registerFont } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

/* ================== GLOBAL CACHE DIRS ================== */
const cacheDir = path.join(__dirname, "cache");
const fontDir = path.join(cacheDir, "fonts");
const canvasFontDir = fontDir;

fs.ensureDirSync(cacheDir);
fs.ensureDirSync(fontDir);

if (!global.temp) global.temp = {};
if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

/* ================== FONT PRELOAD ================== */
(async () => {
  try {
    const fontPath = path.join(fontDir, "tt-modernoir-trial.bold.ttf");
    if (!fs.existsSync(fontPath)) {
      console.log("⏬ Downloading welcome font...");
      const fontUrl =
        "https://github.com/MR-MAHABUB-004/MAHABUB-BOT-STORAGE/raw/main/fronts/tt-modernoir-trial.bold.ttf";
      const { data } = await axios.get(fontUrl, { responseType: "arraybuffer" });
      await fs.writeFile(fontPath, data);
    }
    registerFont(fontPath, { family: "ModernoirBold" });
  } catch (err) {
    console.error("❌ Font preload error:", err.message);
  }
})();

/* ================== EXTRA FONTS ================== */
try {
  registerFont(path.join(fontDir, "BeVietnamPro-Regular.ttf"), {
    family: "BeVietnamPro"
  });
} catch {}

try {
  registerFont(path.join(fontDir, "Kanit-SemiBoldItalic.ttf"), {
    family: "Kanit",
    weight: "600",
    style: "italic"
  });
} catch {}

try {
  registerFont(path.join(canvasFontDir, "Rounded.otf"), {
    family: "Rounded"
  });
} catch {}

/* ================== MAIN EXPORT (ONLY ONE) ================== */
module.exports = {
  config: {
    name: "welcome",
    version: "4.1-fixed",
    author: "MR MAHABUB | fixed by Alihsan Shourov",
    category: "events"
  },

  onStart: async ({ threadsData, event, message, api, usersData }) => {
  try {
    if (event.logMessageType !== "log:subscribe") return;

const { threadID, logMessageData } = event;
const added = logMessageData.addedParticipants?.[0];
if (!added) return;

const botID = api.getCurrentUserID();

    /* ===== BOT ADDED CASE ===== */
    if (added.userFbId === botID) {
  const nickname = global.config.nickNameBot;

  const msg = `
━━━━━━━━━━━━━━━━━━━━━━━━━━
${nickname} ☔︎ 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗘𝗗 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟𝗟
━━━━━━━━━━━━━━━━━━━━━━━━━━
𝗕𝗢𝗧 𝗔𝗗𝗠𝗜𝗡: 𝐀𝐥𝐈𝐇𝐒𝐀𝐍 𝐒𝐇𝐎𝐔𝐑𝐎𝐕
━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
  await api.sendMessage(msg, threadID);
  return;
}
 
    // 🔹 Case 2: Normal user added (welcome canvas)

const threadData = await threadsData.get(threadID);
const threadName = threadData.threadName || "Group Chat";
const memberCount = (await api.getThreadInfo(threadID)).participantIDs.length;

const user = added;
const userName = user.fullName;
const userID = user.userFbId;

  async function createWelcomeCanvas(userID, userName, memberCount) {
  const canvas = createCanvas(1000, 500);
  const ctx = canvas.getContext("2d");

  const avatarUrl = `https://graph.facebook.com/${userID}/picture?width=512&height=512`;

  const backgrounds = [
    "https://files.catbox.moe/cj68oa.jpg",
    "https://files.catbox.moe/0n8mmb.jpg",
    "https://files.catbox.moe/hvynlb.jpg",
    "https://files.catbox.moe/leyeuq.jpg",
    "https://files.catbox.moe/7ufcfb.jpg",
    "https://files.catbox.moe/y78bmv.jpg"
  ];
  const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];

  const bgBuffer = await axios.get(randomBg, { responseType: "arraybuffer" });
  const bg = await loadImage(bgBuffer.data);
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

  let avatar;
  try {
    const res = await axios.get(avatarUrl, { responseType: "arraybuffer" });
    avatar = await loadImage(res.data);
  } catch {
    avatar = await loadImage("https://i.ibb.co/2kR9xgQ/default-avatar.png");
  }

  const size = 200;
  const x = canvas.width / 2 - size / 2;
  const y = 40;

  ctx.save();
  ctx.beginPath();
  ctx.arc(canvas.width / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(avatar, x, y, size, size);
  ctx.restore();

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = 'bold 48px "BeVietnamPro"';
  ctx.fillText(userName, canvas.width / 2, 300);

  ctx.font = 'italic 36px "Kanit"';
  ctx.fillStyle = "#22c55e";
  ctx.fillText("WELCOME", canvas.width / 2, 350);

  ctx.font = '24px "BeVietnamPro"';
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`Member #${memberCount}`, canvas.width / 2, 390);

  return canvas.toBuffer("image/png");
}
const buffer = await createWelcomeCanvas(
  userID,
  userName,
  memberCount
);


const imgPath = path.join(cacheDir, `welcome_${Date.now()}.png`);
await fs.writeFile(imgPath, buffer);

const timeNow = getTime("HH:mm DD/MM/YYYY");

await message.send(
  {
    body: `🎉 Welcome ${userName}\n🕒 Joined at: ${timeNow}`,
    attachment: fs.createReadStream(imgPath)
  },
  () => fs.unlinkSync(imgPath)
);

} catch (e) {
console.error("❌ Welcome Event Error:", e.stack || e.message);
}
}