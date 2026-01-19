const { getTime } = global.utils;
const { createCanvas, loadImage, registerFont } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

// 🔹 Preload font once
(async () => {
  try {
    const fontPath = path.join(__dirname, "cache", "tt-modernoir-trial.bold.ttf");
    if (!fs.existsSync(fontPath)) {
      console.log("⏬ Downloading welcome font...");
      const fontUrl = "https://github.com/MR-MAHABUB-004/MAHABUB-BOT-STORAGE/raw/main/fronts/tt-modernoir-trial.bold.ttf";
      const { data } = await axios.get(fontUrl, { responseType: "arraybuffer" });
      await fs.outputFile(fontPath, data);
      console.log("✅ Font downloaded");
    }
    registerFont(fontPath, { family: "ModernoirBold" });
    console.log("✅ Font registered: ModernoirBold");
  } catch (err) {
    console.error("❌ Font preload error:", err);
  }
})();

module.exports = {
  config: {
    name: "welcome",
    version: "4.1",
    author: "MR᭄﹅ MAHABUB﹅ メꪜ",
    category: "events"
  },

  onStart: async ({ threadsData, message, event, api, getLang }) => {
    try {
      const { threadID, logMessageType, logMessageData } = event;

      const botID = api.getCurrentUserID();
      const addedParticipants = logMessageData.addedParticipants || [];

      if (
  logMessageType === "log:subscribe" &&
  addedParticipants.some(p => p.userFbId === botID)
) {
  const nickname = global.GoatBot?.config?.nickNameBot || "Bot";
  await api.changeNickname(nickname, threadID, botID);

  const msg = `
╭────────────────────────╮
        🤖 ${nickname} CONNECTED
╰────────────────────────╯

✅ STATUS : ONLINE  
⚡ READY TO USE

👑 BOT OWNER  
➤ ALIHSAN SHOUROV

━━━━━━━━━━━━━━━━━━━━━━
⚡ Type /help to get started
━━━━━━━━━━━━━━━━━━━━━━
`;

  const connectedImgPath = path.join(__dirname, "shourov", "connected.png");

  await api.sendMessage(
    {
      body: msg,
      attachment: [
        fs.createReadStream(connectedImgPath),
        await global.utils.getStreamFromURL(
          "https://i.imgur.com/ABC123.png" // optional
        )
      ]
    },
    threadID
  );

  return; // ✅ খুবই জরুরি
}

      // 🔹 Case 2: Normal user added (welcome canvas)
      if (logMessageType !== "log:subscribe") return;

      const threadData = await threadsData.get(threadID);
      const threadName = threadData.threadName || "Group Chat";
      const memberCount = (await api.getThreadInfo(threadID)).participantIDs.length;

      const user = addedParticipants[0];
      const userName = user.fullName;
      const userID = user.userFbId;

      // Avatar URL
      const avatarUrl = `https://graph.facebook.com/${userID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      // Random backgrounds
      const backgrounds = [
        "https://files.catbox.moe/cj68oa.jpg",
        "https://files.catbox.moe/0n8mmb.jpg",
        "https://files.catbox.moe/hvynlb.jpg",
        "https://files.catbox.moe/leyeuq.jpg",
        "https://files.catbox.moe/7ufcfb.jpg",
        "https://files.catbox.moe/y78bmv.jpg"
      ];
      const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];

      // Canvas
      const canvas = createCanvas(1000, 500);
      const ctx = canvas.getContext("2d");

      // Background
      const bg = await loadImage((await axios.get(randomBg, { responseType: "arraybuffer" })).data);
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      // Avatar circle
      let avatar;
      try {
        const response = await axios.get(avatarUrl, { responseType: "arraybuffer" });
        avatar = await loadImage(response.data);
      } catch {
        avatar = await loadImage("https://i.ibb.co/2kR9xgQ/default-avatar.png");
      }

      const avatarSize = 200;
      const avatarX = canvas.width / 2 - avatarSize / 2;
      const avatarY = 40;

      ctx.save();
      ctx.beginPath();
      ctx.arc(canvas.width / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();

      // Text
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 6;

      ctx.font = "bold 55px ModernoirBold";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(userName, canvas.width / 2, 310);

      ctx.font = "bold 35px ModernoirBold";
      ctx.fillStyle = "#ffea00";
      ctx.fillText(threadName.toUpperCase(), canvas.width / 2, 370);

      ctx.font = "bold 30px ModernoirBold";
      ctx.fillStyle = "#00ffcc";
      ctx.fillText(`You're the ${memberCount}th member on this group`, canvas.width / 2, 420);

      // Save image
      const imgPath = path.join(__dirname, "cache", `welcome_${userID}.png`);
      await fs.ensureDir(path.dirname(imgPath));
      const out = fs.createWriteStream(imgPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);
      await new Promise(resolve => out.on("finish", resolve));

      // Send welcome
      message.send(
        {
          body: `‎‎╔════•|      ✿      |•════╗
 💐আ্ঁস্ঁসা্ঁলা্ঁমু্ঁ💚আ্ঁলা্ঁই্ঁকু্ঁম্ঁ💐
╚════•|      ✿      |•════╝

    ✨🆆🅴🅻🅻 🅲🅾🅼🅴✨

                 ❥𝐍𝐄𝐖~

        ~🇲‌🇪‌🇲‌🇧‌🇪‌🇷‌~ ${userName}, ༄✺আ্ঁপ্ঁনা্ঁকে্ঁ আ্ঁমা্ঁদে্ঁর্ঁ✺࿐ ${threadName}🥰🖤🌸—এ্ঁর্ঁ প্ঁক্ষ্ঁ🍀থে্ঁকে্ঁ🍀—🌸🥀

         🥀_ভা্ঁলো্ঁবা্ঁসা্ঁ_অ্ঁভি্ঁরা্ঁম্ঁ_🥀\༄✺আঁপঁনিঁ এঁইঁ গ্রুঁপেঁর  ${memberCount} নঁং মে্ঁম্বা্ঁরঁ ࿐╔╦══•    •✠•❀•✠ •   •══╦╗
        ♥  𝐁𝐎𝐓'𝐬 𝐎𝐖𝐍𝐄𝐑♥

                           ☟                     

      ♥𝐀𝐥𝐈𝐇𝐒𝐀𝐍 𝐒𝐇𝐎𝐔𝐑𝐎𝐕(✷‿✷)♥
    ╚╩══•"`,
          attachment: fs.createReadStream(imgPath)
        },
        () => fs.unlinkSync(imgPath)
      );

    } catch (err) {
      console.error("❌ Welcome event error:", err);
    }
  }
};