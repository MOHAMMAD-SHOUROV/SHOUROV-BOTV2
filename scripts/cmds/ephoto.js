const fs = require("fs");
const path = require("path");
const axios = require("axios");
const Photo360 = require("abir-photo360-apis");

module.exports = {
  config: {
    name: "ephoto",
    aliases: ["ep"],
    version: "1.2.2",
    prefix: false,
    author: "IMRAN (Fixed by ChatGPT)",
    role: 0,
    cooldown: 5,
    category: "textmaker",
    shortDescription: "Generate stylish images with Ephoto360",
    longDescription: "Create stylish images from text using different Ephoto360 templates.",
    guide: {
      en: "{pn} <templateID> <text>\n\nExample:\n{pn} 1 Imran\n\nUse: {pn} list → to see available templates"
    }
  },

  // Main handler
  onStart: async function ({ api, event, args, message }) {
    const templates = {
      "1": "Foggy glass text",
      "2": "Cloud text",
      "3": "Light glow",
      "4": "Glitch text",
      "5": "3D metal",
      "6": "Foggy rainy",
      "7": "Sand writing",
      "8": "Diamond text",
      "9": "Neon signature",
      "10": "Broken glass",
      "11": "Multicolor arrow",
      "12": "Graffiti wall",
      "13": "Watercolor",
      "14": "Night lend",
      "15": "Sky clouds",
      "16": "Beach sand",
      "17": "Dark green",
      "18": "Stars night",
      "19": "3D sand",
      "20": "Summery sand",
      "21": "Firework text",
      "22": "Leaves ligature",
      "23": "Letters on leaves",
      "24": "Graffiti color",
      "25": "Paper cut"
    };

    const urls = {
      "1": "https://en.ephoto360.com/handwritten-text-on-foggy-glass-online-680.html",
      "2": "https://en.ephoto360.com/create-realistic-cloud-text-effect-606.html",
      "3": "https://en.ephoto360.com/light-glow-text-effect-369.html",
      "4": "https://en.ephoto360.com/glitch-text-effect-online-345.html",
      "5": "https://en.ephoto360.com/3d-metal-text-effect-600.html",
      "6": "https://en.ephoto360.com/foggy-rainy-text-effect-75.html",
      "7": "https://en.ephoto360.com/write-in-sand-summer-beach-online-free-595.html",
      "8": "https://en.ephoto360.com/diamond-text-95.html",
      "9": "https://en.ephoto360.com/create-multicolored-neon-light-signatures-591.html",
      "10": "https://en.ephoto360.com/create-broken-glass-text-effect-online-698.html",
      "11": "https://en.ephoto360.com/create-multicolored-signature-attachment-arrow-effect-714.html",
      "12": "https://en.ephoto360.com/create-a-graffiti-text-effect-on-the-wall-online-665.html",
      "13": "https://en.ephoto360.com/create-a-watercolor-text-effect-online-655.html",
      "14": "https://en.ephoto360.com/creating-text-effects-night-lend-for-word-effect-147.htm",
      "15": "https://en.ephoto360.com/write-text-effect-clouds-in-the-sky-online-619.html",
      "16": "https://en.ephoto360.com/write-in-sand-summer-beach-online-576.html",
      "17": "https://en.ephoto360.com/dark-green-typography-online-359.html",
      "18": "https://en.ephoto360.com/stars-night-online-1-85.html",
      "19": "https://en.ephoto360.com/realistic-3d-sand-text-effect-online-580.html",
      "20": "https://en.ephoto360.com/create-a-summery-sand-writing-text-effect-577.html",
      "21": "https://en.ephoto360.com/text-firework-effect-356.html",
      "22": "https://en.ephoto360.com/ligatures-effects-from-leaves-146.html",
      "23": "https://en.ephoto360.com/write-letters-on-the-leaves-248.html",
      "24": "https://en.ephoto360.com/graffiti-color-199.html",
      "25": "https://en.ephoto360.com/caper-cut-effect-184.html"
    };

    // Show template list
    if (args[0] && args[0].toLowerCase() === "list") {
      let msg = "📌 Available Ephoto templates:\n\n";
      for (const id in templates) msg += `${id}. ${templates[id]}\n`;
      return message.reply(msg);
    }

    // Missing arguments
    if (args.length < 2) {
      return message.reply(
        "⚠ Please provide a template ID and text.\n\nExample:\n.ephoto 1 Mahabub\n\nUse `.ephoto list` to see all templates."
      );
    }

    const templateID = args[0];
    const text = args.slice(1).join(" ");

    if (!urls[templateID]) {
      return message.reply("❌ Invalid template ID. Use `.ephoto list` to see all available templates.");
    }

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const imagePath = path.join(cacheDir, `ephoto_${Date.now()}.png`);

    try {
      const photo360 = new Photo360(urls[templateID]);
      photo360.setName(text);

      const result = await photo360.execute();
      const response = await axios.get(result.imageUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(imagePath, response.data);

      await message.reply({
        body: `✅ Created "${text}" using template #${templateID} (${templates[templateID]})`,
        attachment: fs.createReadStream(imagePath)
      });

      // 🧹 Auto delete file after 15 seconds
      setTimeout(() => {
        if (fs.existsSync(imagePath)) {
          fs.unlink(imagePath, (err) => {
            if (!err) console.log(`🧹 Deleted cached file: ${imagePath}`);
          });
        }
      }, 15000);

    } catch (err) {
      console.error("Ephoto Error:", err);
      return message.reply("❌ Failed to generate image. Please try again later.");
    }
  }
};
