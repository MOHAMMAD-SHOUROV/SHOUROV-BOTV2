const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "imagine",
    aliases: ["img", "gen", "im"],
    version: "1.1",
    author: "MR᭄﹅ MAHABUB﹅ メꪜ (Improved by ChatGPT)",
    countDown: 5,
    role: 0,
    description: "Generate image from prompt using Mahabub imagine API",
    category: "AI",
    guide: "{p}imagine <prompt>\nOr reply to a message containing the prompt."
  },

  onStart: async ({ api, event, args, message }) => {
    try {
      let prompt = args.join(" ").trim() || event.messageReply?.body?.trim();
      if (!prompt) return message.reply("❌ Use: /imagine <prompt>");

      const cacheDir = path.join(__dirname, "cache");
      fs.ensureDirSync(cacheDir);

      try { api.setMessageReaction("⏳", event.messageID, () => {}, true); } catch {}

      const { data, headers } = await axios.get("https://mahabub-imagine-api.vercel.app/api/gen", {
        params: { prompt },
        responseType: "arraybuffer",
        timeout: 60000
      });

      const contentType = headers["content-type"]?.toLowerCase() || "";
      let filePath;

      if (contentType.includes("application/json")) {
        const json = JSON.parse(Buffer.from(data).toString("utf8"));
        let imageData = json?.image || json?.image_url || json?.data || json?.image_data || json?.result || (typeof json === "string" && json);

        if (!imageData) {
          try { api.setMessageReaction("❌", event.messageID, () => {}, true); } catch {}
          return message.reply("❌ API returned JSON but no image found.");
        }

        if (imageData.startsWith("data:image")) {
          filePath = path.join(cacheDir, `imagine_${Date.now()}.png`);
          fs.writeFileSync(filePath, Buffer.from(imageData.split(",")[1], "base64"));
        } else {
          const down = await axios.get(imageData, { responseType: "arraybuffer", timeout: 60000 });
          const ext = down.headers["content-type"]?.includes("png") ? "png" : "jpg";
          filePath = path.join(cacheDir, `imagine_${Date.now()}.${ext}`);
          fs.writeFileSync(filePath, down.data);
        }
      } else if (contentType.startsWith("image/")) {
        const ext = contentType.split("/")[1].split(";")[0] || "png";
        filePath = path.join(cacheDir, `imagine_${Date.now()}.${ext}`);
        fs.writeFileSync(filePath, data);
      } else {
        const txt = Buffer.from(data).toString("utf8");
        const url = txt.match(/https?:\/\/\S+/)?.[0];
        if (!url) return message.reply("❌ API returned unsupported response.");

        const down = await axios.get(url, { responseType: "arraybuffer", timeout: 60000 });
        const ext = down.headers["content-type"]?.includes("png") ? "png" : "jpg";
        filePath = path.join(cacheDir, `imagine_${Date.now()}.${ext}`);
        fs.writeFileSync(filePath, down.data);
      }

      try { api.setMessageReaction("✅", event.messageID, () => {}, true); } catch {}

      await message.reply({
        body: `✅ Generated: ${prompt}`,
        attachment: fs.createReadStream(filePath)
      });

      // 🧹 Auto delete the file after 15 seconds
      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (!err) console.log(`🧹 Deleted cached file: ${filePath}`);
          });
        }
      }, 15000);

    } catch (err) {
      console.error("imagine.js error:", err?.message || err);
      try { api.setMessageReaction("❌", event.messageID, () => {}, true); } catch {}
      message.reply("❌ Failed to generate image.");
    }
  }
};