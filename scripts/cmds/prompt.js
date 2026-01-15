const axios = require("axios");

module.exports = {
  config: {
    name: "prompt",
    aliases: ["imgprompt"],
    version: "1.0.0",
    author: "mahabub",
    role: 0,
    shortDescription: {
      en: "Generate a text prompt from an image"
    },
    longDescription: {
      en: "Generate a text prompt from an image using API"
    },
    category: "ai",
    guide: {
      en: "{p}prompt (reply to an image)"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
        return api.sendMessage("⚠ Please reply to an image.", event.threadID, event.messageID);
      }

      const attachment = event.messageReply.attachments[0];
      if (attachment.type !== "photo") {
        return api.sendMessage("⚠ Only image attachments are supported.", event.threadID, event.messageID);
      }

      const imageUrl = attachment.url;
      const response = await axios.get(
        `https://mahabub-prompt-api.vercel.app/api/prompt?url=${encodeURIComponent(imageUrl)}`
      );

      if (response.data && response.data.prompt) {
        return api.sendMessage(
          `📝 Prompt generated \n\n${response.data.prompt}`,
          event.threadID,
          event.messageID
        );
      } else {
        return api.sendMessage("❌ No prompt found in response.", event.threadID, event.messageID);
      }
    } catch (error) {
      return api.sendMessage("❌ Error while generating prompt.", event.threadID, event.messageID);
    }
  }
};