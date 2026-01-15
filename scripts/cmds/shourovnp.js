const axios = require("axios");

module.exports = {
  config: {
    name: "npx36",
    version: "2.0.0",
    author: "shourov",
    role: 0,
    shortDescription: "Auto trigger emoji/text video system",
    longDescription: "Automatically sends video when specific text/emoji is detected",
    category: "auto",
    guide: "Auto trigger, no command needed"
  },

  // GoatBot uses onStart OR onChat, not handleEvent
  onChat: async ({ api, event }) => {
    try {
      if (!event.body) return;

      const text = event.body.toLowerCase();

      // 🔒 same body for all videos
      const BODY_TEXT = "🖤 ALIHSAN SHOUROV 🖤";

      // 🎯 trigger rules
      const rules = [
        {
          triggers: ["bura beti", "😵‍💫", "😵"],
          videos: ["https://i.imgur.com/6EaYYaU.mp4"]
        },
        {
          triggers: ["🤴"],
          videos: ["https://files.catbox.moe/1bx2l9.mp4"]
        },
        {
          triggers: ["6"],
          videos: ["https://files.catbox.moe/h1c7pz.mp4"]
        },
        {
          triggers: ["7"],
          videos: ["https://files.catbox.moe/kp8t84.mp4"]
        },
        {
          triggers: ["8"],
          videos: [
            "https://files.catbox.moe/env58m.mp4",
            "https://files.catbox.moe/mrtvhb.mp4"
          ]
        },
        {
          triggers: ["👿"],
          videos: ["https://files.catbox.moe/1bx2l9.mp4"]
        },
        {
          triggers: ["9"],
          videos: ["https://files.catbox.moe/7cf5c9.mp4"]
        },
        {
          triggers: ["5"],
          videos: [
            "https://files.catbox.moe/8sctaw.mp4",
            "https://i.imgur.com/fPwwRS3.mp4"
          ]
        },
        {
          triggers: ["😍", "🥰"],
          videos: ["https://files.catbox.moe/8sctaw.mp4"]
        },
        {
          triggers: [
            "king",
            "shourov",
            "alihsan",
            "alihsan shourov",
            "সৌরভ",
            "bos",
            "boss"
          ],
          videos: ["https://files.catbox.moe/4zg8rq.mp4"]
        },
        {
          triggers: ["call a aso", "😡"],
          videos: [
            "https://i.imgur.com/hj4iPpe.mp4",
            "https://files.catbox.moe/6c0keb.mp4"
          ]
        },
        {
          triggers: ["@everyone", "jikir", "জিকির"],
          videos: ["https://files.catbox.moe/omt6x5.mp4"]
        },
        {
          triggers: [
            "love",
            "i love you",
            "i love u",
            "valobashi",
            "🖤",
            "❤️‍🔥",
            "💌",
            "💘",
            "💟"
          ],
          videos: ["https://files.catbox.moe/6yzt2m.mp4"]
        }
      ];

      for (const rule of rules) {
        if (rule.triggers.some(t => text.includes(t))) {
          const videoURL =
            rule.videos[Math.floor(Math.random() * rule.videos.length)];

          const res = await axios.get(videoURL, {
            responseType: "stream",
            timeout: 30000
          });

          return api.sendMessage(
            {
              body: BODY_TEXT,
              attachment: res.data
            },
            event.threadID,
            event.messageID
          );
        }
      }
    } catch (err) {
      console.error("[npx36 error]", err.message);
    }
  }
};