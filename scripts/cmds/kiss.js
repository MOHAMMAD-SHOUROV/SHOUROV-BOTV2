const Jimp = require("jimp");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "k",
    aliases: ["ki"],
    version: "6.3",
    author: "NIROB",
    countDown: 5,
    role: 0,
    shortDescription: "KISS",
    longDescription: "Send kiss pic with merged profile pictures",
    category: "funny",
    guide: "{pn} @mention"
  },

  onStart: async function ({ api, message, event }) {
    const mention = Object.keys(event.mentions);

    if (!mention.length) return message.reply("⚠️ Please mention someone!");

    const senderID = event.senderID;
    const targetID = mention[0];

    // Fetch user info to get names and genders
    let senderName = "";
    let targetName = "";
    let targetGender = "male"; // default male
    try {
      const users = await api.getUserInfo([senderID, targetID]);
      senderName = users[senderID]?.name || "Sender";
      targetName = users[targetID]?.name || "Target";
      targetGender = users[targetID]?.gender || "male";
    } catch (err) {
      console.log("Error fetching user info:", err);
      senderName = "Sender";
      targetName = "Target";
    }

    // Facebook Graph API profile pics
    const avatarSender = `https://graph.facebook.com/${senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const avatarTarget = `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    // Catbox kiss background
    const catboxKissUrl = "https://files.catbox.moe/szs5fk.jpg";

    try {
      // Download images
      const [bgBuffer, bufSender, bufTarget] = await Promise.all([
        axios.get(catboxKissUrl, { responseType: "arraybuffer" }).then(res => res.data),
        axios.get(avatarSender, { responseType: "arraybuffer" }).then(res => res.data),
        axios.get(avatarTarget, { responseType: "arraybuffer" }).then(res => res.data)
      ]);

      // Read images with Jimp
      const bg = await Jimp.read(bgBuffer);
      const imgSender = await Jimp.read(bufSender);
      const imgTarget = await Jimp.read(bufTarget);

      // Resize avatars
      imgSender.resize(140, 140);
      imgTarget.resize(160, 160);

      // Merge avatars based on gender
      if (targetGender === "male") {
        // Male on left (catbox), female on right
        bg.composite(imgTarget, 50, bg.getHeight() - 450); // male position
        bg.composite(imgSender, bg.getWidth() - 225, bg.getHeight() - 500); // sender/female
      } else {
        // Female on left (catbox), male on right
        bg.composite(imgSender, 50, bg.getHeight() - 450); // sender/male
        bg.composite(imgTarget, bg.getWidth() - 225, bg.getHeight() - 500); // female position
      }

      // Save temp image
      const tempPath = path.join(__dirname, `tmp/${senderID}_${targetID}_kiss.png`);
      await fs.ensureDir(path.dirname(tempPath));
      await bg.writeAsync(tempPath);

      // Reply with merged image and Facebook names
      await message.reply({
        body: `😘 ${senderName} kisses ${targetName}!`,
        attachment: fs.createReadStream(tempPath)
      });

      // Delete temp image
      fs.unlinkSync(tempPath);

    } catch (err) {
      console.log("Error creating kiss image:", err);
      message.reply("⚠️ Error: Could not create kiss image!");
    }
  }
};