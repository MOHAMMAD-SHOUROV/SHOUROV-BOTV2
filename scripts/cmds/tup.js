const os = require("os");

if (!global.botStartTime) global.botStartTime = Date.now();

function formatDuration(ms) {
  let seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / (3600 * 24));
  seconds %= 3600 * 24;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function createProgressBar(percentage, length = 15) {
  const filled = Math.round((percentage / 100) * length);
  return "█".repeat(filled) + "░".repeat(length - filled);
}

module.exports = {
  config: {
    name: "tup",
    version: "2.0",
    author: "MR᭄﹅ MAHABUB﹅ メꪜ",
    countDown: 5,
    role: 0,
    description: "Check bot uptime with style",
    category: "system",
  },

  onStart: async function ({ api, event }) {
    // First message
    const msg = await api.sendMessage("⚡ Checking bot uptime 👾...", event.threadID);

    // Calculate data
    const uptime = formatDuration(Date.now() - global.botStartTime);
    const cpuUsage = os.loadavg()[0].toFixed(2);
    const ramUsage = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);

    // Fake % based on uptime seconds
    const percent = Math.min(
      100,
      Math.floor(((Date.now() - global.botStartTime) / (1000 * 60 * 60 * 24)) * 100)
    );
    const progress = createProgressBar(percent, 20);

    // Final styled message
    const styledMsg = 
`✨ 𝗕𝗼𝘁 𝗨𝗽𝘁𝗶𝗺𝗲 𝗦𝘁𝗮𝘁𝘂𝘀 ✨

⏳ 𝗨𝗽𝘁𝗶𝗺𝗲: ${uptime}
💻 𝗖𝗣𝗨 𝗟𝗼𝗮𝗱: ${cpuUsage}
📦 𝗠𝗲𝗺𝗼𝗿𝘆: ${ramUsage} MB

📊 𝗣𝗿𝗼𝗴𝗿𝗲𝘀𝘀: [${progress}] ${percent}%
`;

    // Edit previous message
    api.editMessage(styledMsg, msg.messageID);
  },
};