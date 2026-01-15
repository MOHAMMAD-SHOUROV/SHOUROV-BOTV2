const osu = require("node-os-utils");
const os = require("os");

if (!global.botStartTime) global.botStartTime = Date.now();

function createGraphBar(percentage, length = 15) {
  const filled = Math.round((percentage / 100) * length);
  const empty = length - filled;
  return "█".repeat(filled) + "░".repeat(empty) + ` ${percentage.toFixed(1)}%`;
}

module.exports = {
  config: {
    name: "upx",
    aliases: ["upx", "uptx"],
    version: "6.9",
    author: "VEX_ADNAN (Fixed by Mahabub)",
    role: 0,
    category: "system",
    shortDescription: "Show bot uptime & system info",
    longDescription: "Display bot uptime, CPU, RAM usage, OS info and group statistics",
    guide: "{pn}"
  },

  onStart: async function ({ message, api, event }) {
    try {
      // --- uptime ---
      const ms = Date.now() - global.botStartTime;
      const d = Math.floor(ms / 86400000);
      const h = Math.floor(ms / 3600000) % 24;
      const m = Math.floor(ms / 60000) % 60;
      const s = Math.floor(ms / 1000) % 60;
      const uptimeStr = `${d}d ${h}h ${m}m ${s}s`;

      // --- system stats ---
      const cpuUsage = await osu.cpu.usage();
      const mem = await osu.mem.info();
      const cpuBar = createGraphBar(cpuUsage, 15);
      const ramBar = createGraphBar((mem.usedMemMb / mem.totalMemMb) * 100, 15);

      const platform = os.platform();
      const arch = os.arch();
      const release = os.release();
      const hostname = os.hostname();
      const uniqueId = Math.random().toString(36).slice(2, 8);

      // --- safe group info ---
      let groupName = "Unknown Group";
      let totalUsers = 0;
      let adminCount = 0;
      let totalGroups = 0;
      let totalMembersInAllGroups = 0;

      try {
        const threadInfo = await api.getThreadInfo(event.threadID);
        groupName = threadInfo.threadName || "Unnamed Group";
        totalUsers = threadInfo.participantIDs.length;
        adminCount = threadInfo.adminIDs.length;
      } catch {}

      try {
        const allThreads = await api.getThreadList(100, null, ["INBOX"]);
        const groupThreads = allThreads.filter(t => t.isGroup);
        totalGroups = groupThreads.length;
        totalMembersInAllGroups = groupThreads.reduce(
          (sum, g) => sum + g.participantIDs.length,
          0
        );
      } catch {}

      // --- image url ---
      const imageUrl = "https://i.imgur.com/wNuWMb3.jpeg";
      let attachment = null;

      if (global.utils && typeof global.utils.getStreamFromURL === "function") {
        try {
          attachment = await global.utils.getStreamFromURL(imageUrl);
        } catch {}
      }

      // --- final message ---
      const msg = `
💫「𝐌𝐀𝐇𝐀𝐁𝐔𝐁-𝐁𝐎𝐓 」🩷🪽 𝐒𝐓𝐀𝐓𝐔𝐒 🗯️

⏳ Uptime : ${uptimeStr}

💻 CPU    : ${cpuBar}
🧠 RAM    : ${ramBar}

🖥 OS     : ${platform} ${arch} (v${release})
🏷 Host   : ${hostname}
🆔 UID    : ${uniqueId}

👥 Current Group : ${groupName}
👤 Members       : ${totalUsers}
🛡 Admins        : ${adminCount}

🌍 Total Groups  : ${totalGroups}
👥 Total Users   : ${totalMembersInAllGroups}

👑 Oᗯᑎᗩᖇ : 𝐌𝐀𝐇𝐀𝐁𝐔𝐁
🐺 ᗯᑭ  : +8801613356376
`;

      message.reply(attachment ? { body: msg, attachment } : { body: msg });
    } catch (err) {
      console.error("Uptime error:", err);
      message.reply("❌ Error while checking uptime.");
    }
  }
};