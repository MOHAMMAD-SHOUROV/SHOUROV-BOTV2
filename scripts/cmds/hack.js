const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");

async function wrapText(ctx, text, maxWidth) {
  return new Promise((resolve) => {
    if (ctx.measureText(text).width < maxWidth) return resolve([text]);
    if (ctx.measureText("W").width > maxWidth) return resolve(null);

    const words = text.split(" ");
    const lines = [];
    let line = "";

    while (words.length > 0) {
      let split = false;

      while (ctx.measureText(words[0]).width >= maxWidth) {
        const temp = words[0];
        words[0] = temp.slice(0, -1);

        if (split) words[1] = `${temp.slice(-1)}${words[1]}`;
        else {
          split = true;
          words.splice(1, 0, temp.slice(-1));
        }
      }

      if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) {
        line += `${words.shift()} `;
      } else {
        lines.push(line.trim());
        line = "";
      }

      if (words.length === 0) lines.push(line.trim());
    }

    return resolve(lines);
  });
}

module.exports = {
  config: {
    name: "hack",
    author: "alihsan shourov",
    countDown: 5,
    role: 0,
    category: "fun",
    shortDescription: {
      en: "Generates a 'hacking' image with the user's profile photo.",
    },
  },

  onStart: async function ({ api, event }) {
    try {
      let pathImg = __dirname + "/tmp/background.png";
      let pathAvt1 = __dirname + "/tmp/Avtmot.png";

      var id = Object.keys(event.mentions)[0] || event.senderID;
      var nameInfo = await api.getUserInfo(id);
      var name = nameInfo[id].name;

      var background = ["https://files.catbox.moe/ibmk54.jpg"];
      var rd = background[Math.floor(Math.random() * background.length)];

      // Avatar
      let getAvtmot = (
        await axios.get(
          `https://graph.facebook.com/${id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" }
        )
      ).data;
      fs.writeFileSync(pathAvt1, Buffer.from(getAvtmot, "utf-8"));

      // Background
      let getbackground = (
        await axios.get(rd, { responseType: "arraybuffer" })
      ).data;
      fs.writeFileSync(pathImg, Buffer.from(getbackground, "utf-8"));

      // Canvas work
      let baseImage = await loadImage(pathImg);
      let baseAvt1 = await loadImage(pathAvt1);

      let canvas = createCanvas(baseImage.width, baseImage.height);
      let ctx = canvas.getContext("2d");

      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      ctx.font = "400 20px Arial";
      ctx.fillStyle = "#1878F3";

      const lines = await wrapText(ctx, name, 1160);
      ctx.fillText(lines.join("\n"), 150, 445);

      ctx.drawImage(baseAvt1, 55, 405, 70, 70);

      const imageBuffer = canvas.toBuffer();
      fs.writeFileSync(pathImg, imageBuffer);

      fs.removeSync(pathAvt1);

      return api.sendMessage(
        {
          body: "✅ 𝙎𝙪𝙘𝙘𝙚𝙨𝙨𝙛𝙪𝙡𝙡𝙮 𝙃𝙖𝙘𝙠𝙚𝙙 𝙏𝙝𝙞𝙨 𝙐𝙨𝙚𝙧!\nMy Lord, আইড়ি বাঁচাতে চাইলে Alihsan Shourov বসকে তাড়াতাড়ি ইনবক্স দে!",
          attachment: fs.createReadStream(pathImg),
        },
        event.threadID,
        () => fs.unlinkSync(pathImg),
        event.messageID
      );
    } catch (error) {
      return api.sendMessage(
        "❌ Error generating hack image!",
        event.threadID,
        event.messageID
      );
    }
  },
};
