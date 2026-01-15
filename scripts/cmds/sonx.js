const axios = require("axios");

module.exports = {
  config: {
    name: "songx",
    version: "1.3", 
    prefix: false,
    author: "Mostakim",
    countDown: 5,
    role: 0,
    category: "music",
    guide:
      "{pn} [optional video/audio URL] or just reply to a video/audio message",
  },

  onStart: async function ({ api, event, args }) {
    
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    let mediaUrl = args.join(" ").trim();

    if (!mediaUrl && event.messageReply?.attachments?.length) {
      const att = event.messageReply.attachments[0];
      if (att.type === "video" || att.type === "audio") {
        mediaUrl = att.url;
      }
    }

    if (!mediaUrl) {
      return api.sendMessage(
        "❌ Please provide a video/audio URL or reply to a video/audio message.",
        event.threadID,
        event.messageID
      );
    }

    const apiUrl = `https://www.noobs-api.rf.gd/dipto/songFind?url=${encodeURIComponent(
      mediaUrl
    )}`;

    try {
      const { data } = await axios.get(apiUrl);

      if (!data.track || !data.track.title) {
        return api.sendMessage(
          "⚠️ No song match found.",
          event.threadID,
          event.messageID
        );
      }

      const t = data.track;

      const album =
        t.sections?.[0]?.metadata?.find((m) => m.title === "Album")?.text ||
        "N/A";
      const release =
        t.sections?.[0]?.metadata?.find((m) => m.title === "Released")?.text ||
        "N/A";

      let msg = `🎶 **Song Identified**
• Title: ${t.title}
• Artist(s): ${t.subtitle}
• Album: ${album}
• Released: ${release}
• Genre: ${t.genres?.primary || "N/A"}`;

      
      let previewUrl = null;
      const actions = t.hub?.actions || [];
      for (const a of actions) {
        if (a.type === "uri" && a.uri.endsWith(".m4a")) {
          previewUrl = a.uri;
          break;
        }
      }

      if (!previewUrl && t.hub?.options?.length) {
        for (const opt of t.hub.options) {
          if (opt.actions) {
            const u = opt.actions.find(
              (ac) => ac.type === "uri" && ac.uri.endsWith(".m4a")
            );
            if (u) {
              previewUrl = u.uri;
              break;
            }
          }
        }
      }

      if (previewUrl) {
        const audioStream = await axios.get(previewUrl, { responseType: "stream" });
        return api.sendMessage(
          { body: msg, attachment: audioStream.data },
          event.threadID,
          event.messageID
        );
      } else {
        return api.sendMessage(
          msg + "\n(No audio preview available)",
          event.threadID,
          event.messageID
        );
      }
    } catch (err) {
      console.error(err);
      return api.sendMessage(
        "❌ Error while fetching song info or audio preview.",
        event.threadID,
        event.messageID
      );
    }
  },
};