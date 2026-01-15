const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");
const https = require("https");

function deleteAfterTimeout(filePath, timeout = 15000) {
  setTimeout(() => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (!err) console.log(`✅ Deleted: ${filePath}`);
        else console.error(`❌ Delete error: ${filePath}`);
      });
    }
  }, timeout);
}

module.exports = {
  config: {
    name: "song",
    aliases: ["music"],
    version: "4.0",
    prefix: false,
    author: "‎MR᭄﹅ MAHABUB﹅ メꪜ",
    countDown: 5,
    role: 0,
    shortDescription: "Download MP3 using YouTube search",
    longDescription: "Search YouTube then fetch MP3 from Mahabub CDN API",
    category: "media",
    guide: "{p}{n} <song name>",
  },

  onStart: async function ({ api, event, args }) {
    if (!args.length) {
      return api.sendMessage(
        "» উফফ কি গান শুনতে চাস তার ২/১ লাইন তো লেখবি নাকি 😾",
        event.threadID,
        event.messageID
      );
    }

    const songName = args.join(" ");
    let searchMsg;

    try {
      // 🔍 Searching message
      searchMsg = await api.sendMessage(
        `🔍 Searching for "${songName}"...`,
        event.threadID
      );

      // 🔎 YouTube search
      const result = await ytSearch(songName);
      if (!result.videos.length) throw new Error("No YouTube results.");

      const top = result.videos[0];
      const ytUrl = `https://youtu.be/${top.videoId}`;

      // 🌐 Get audio link from API
      const cdnUrl = `https://mahabub-ytmp3.vercel.app/api/cdn?url=${encodeURIComponent(
        ytUrl
      )}`;
      const { data } = await axios.get(cdnUrl);

      if (!data.status || !data.cdna)
        throw new Error("Audio link not found in API.");

      const title = data.title || "Unknown Title";
      const audioLink = data.cdna;

      // ✏ Edit search message → FOUND + downloading
      await api.editMessage(
        `✅ FOUND: ${title}\n⬇ Downloading...`,
        searchMsg.messageID
      );

      // 📂 File path
      const safeFile = title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
      const ext = audioLink.includes(".mp3") ? "mp3" : "m4a";
      const filePath = path.join(__dirname, "cache", `${safeFile}.${ext}`);

      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
      }

      // ⬇ Download audio
      const file = fs.createWriteStream(filePath);
      await new Promise((resolve, reject) => {
        https
          .get(audioLink, (res) => {
            if (res.statusCode === 200) {
              res.pipe(file);
              file.on("finish", () => file.close(resolve));
            } else reject(new Error(`Download failed [${res.statusCode}]`));
          })
          .on("error", reject);
      });

      // 🎵 Send audio and then auto delete
      await api.sendMessage(
        {
          body: `🎶 ${title}\n✅ Downloaded successfully!`,
          attachment: fs.createReadStream(filePath),
        },
        event.threadID,
        (err) => {
          if (!err) deleteAfterTimeout(filePath, 10000); // Auto delete 10s after send
          else console.error("❌ Send message error:", err);
        },
        event.messageID
      );

      // Update search message to success
      await api.editMessage(`✅ Sent: ${title}`, searchMsg.messageID);
    } catch (err) {
      console.error("❌ Error:", err.message);
      if (searchMsg?.messageID) {
        api.editMessage(`❌ Failed: ${err.message}`, searchMsg.messageID);
      } else {
        api.sendMessage(
          `❌ Failed: ${err.message}`,
          event.threadID,
          event.messageID
        );
      }
    }
  },
};
