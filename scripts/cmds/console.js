
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "console",
    aliases: ["log"],
    version: "1.2",
    author: "Mahabub Pk",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Toggle console logging"
    },
    longDescription: {
      en: "Enable or disable console message logging for all incoming messages"
    },
    category: "system",
    guide: {
      en: "{p}console on/off"
    }
  },

  // Global toggle state
  consoleEnabled: false,

  // ✅ Run command manually to toggle logging
  onStart: async function({ api, event, args }) {
    if (!args[0]) {
      return api.sendMessage("Usage: console on / off", event.threadID, event.messageID);
    }

    const option = args[0].toLowerCase();
    if (option === "on") {
      this.consoleEnabled = true;
      api.sendMessage("✅ Console logging has been enabled.", event.threadID, event.messageID);
    } else if (option === "off") {
      this.consoleEnabled = false;
      api.sendMessage("❌ Console logging has been disabled.", event.threadID, event.messageID);
    } else {
      api.sendMessage("❓ Invalid option. Use: on / off", event.threadID, event.messageID);
    }
  },

  // ✅ Auto log all incoming messages when enabled
  onChat: async function({ api, event, Users, Threads }) {
    if (!this.consoleEnabled || !event.body) return;

    try {
      const threadInfo = await Threads.getInfo(event.threadID);
      const userInfo = await Users.getNameUser(event.senderID);

      const threadName = threadInfo.threadName || "Private Chat";
      const message = event.body;
      const time = moment.tz("Asia/Dhaka").format("DD/MM/YYYY • hh:mm:ss A");

      console.log("======================================");
      console.log(`📩 ${threadName}`);
      console.log(`👤 ${userInfo} (${event.senderID})`);
      console.log(`💬 ${message}`);
      console.log(`⏰ ${time}`);
      console.log("======================================\n");
    } catch (e) {
      console.log("[Console Log Error]", e);
    }
  }
};
