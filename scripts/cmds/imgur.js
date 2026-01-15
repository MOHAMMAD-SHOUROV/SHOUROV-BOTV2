const axios = require("axios");

module.exports = {
  config: {
    name: "imgur",
    aliases: ["imagegur","imgbb"],
    version: "1.0",
    author: "MR᭄﹅ MAHABUB﹅ メꪜ",
    countDown: 0,
    role: 0,
    shortDescription: "Upload an image to Imgur",
    longDescription: "Upload any image to Imgur and receive a direct link.",
    category: "utility",
    guide: "{pn} reply to an image, video, or provide a URL"
  },

  onStart: async function ({ api, event, args }) {
    try {
      let imageUrl = "";

      if (event.messageReply && event.messageReply.attachments.length > 0) {
        imageUrl = event.messageReply.attachments[0].url;
      } else if (args.length > 0) {
        imageUrl = args.join(" ");
      }

      if (!imageUrl) {
        return api.sendMessage(
          "❌ Please reply to an image, video, or provide a URL!",
          event.threadID,
          event.messageID
        );
      }

      const response = await axios.get(
        `https://imgur-upload-psi.vercel.app/mahabub?url=${encodeURIComponent(
          imageUrl
        )}`
      );

      if (response.data && response.data.url) {
        let fileType = "Image";
        if (response.data.url.endsWith(".mp4")) fileType = "Video";
        else if (response.data.url.endsWith(".gif")) fileType = "GIF";

        return api.sendMessage(
          `✅ ${fileType} uploaded successfully!\n\n🔗 URL: ${response.data.url}`,
          event.threadID,
          event.messageID
        );
      } else {
        return api.sendMessage(
          "❌ Failed to upload the image.",
          event.threadID,
          event.messageID
        );
      }
    } catch (error) {
      console.error(error);
      return api.sendMessage(
        "⚠️ An error occurred while uploading the image.",
        event.threadID,
        event.messageID
      );
    }
  }
};
