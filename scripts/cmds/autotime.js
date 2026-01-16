let sentToday = {};

module.exports = {
  config: {
    name: "autotime",
    version: "10.02",
    author: "Alihsan Shourov",
    role: 0,
    category: "group",
    shortDescription: "Auto time announce system",
    longDescription: "Automatically sends time messages every hour",
    guide: "Auto system, no command needed"
  },

  // ⏰ Scheduled messages
  messages: [
    { timer: "23:00:00", message: "🕚 11:00 PM ...𝐒𝐇𝐎𝐔𝐑𝐎𝐕_𝐁𝐎𝐓" },
    { timer: "00:00:00", message: "🕛 12:00 AM ...𝐒𝐇𝐎𝐔𝐑𝐎𝐕_𝐁𝐎𝐓" },
    { timer: "01:00:00", message: "🕐 1:00 AM ...𝐒𝐇𝐎𝐔𝐑𝐎𝐕_𝐁𝐎𝐓" },
    { timer: "02:00:00", message: "🕑 2:00 AM ...𝐒𝐇𝐎𝐔𝐑𝐎𝐕_𝐁𝐎𝐓" },
    { timer: "03:00:00", message: "🕒 3:00 AM ...𝐒𝐇𝐎𝐔𝐑𝐎𝐕_𝐁𝐎𝐓" },
    { timer: "04:00:00", message: "🕓 4:00 AM ...𝐒𝐇𝐎𝐔𝐑𝐎𝐕_𝐁𝐎𝐓" },
    { timer: "05:00:00", message: "🕔 5:00 AM ...𝐒𝐇𝐎𝐔𝐑𝐎𝐕_𝐁𝐎𝐓" },
    { timer: "06:00:00", message: "🕕 6:00 AM ...𝐒𝐇𝐎𝐔𝐑𝐎𝐕_𝐁𝐎𝐓" },
    { timer: "07:00:00", message: "🕖 7:00 AM ...𝐒𝐇𝐎𝐔𝐑𝐎𝐕_𝐁𝐎𝐓" },
    { timer: "08:00:00", message: "🕗 8:00 AM ...𝐒𝐇𝐎𝐔𝐑𝐎𝐕_𝐁𝐎𝐓" },
    { timer: "09:00:00", message: "🕘 9:00 AM ...𝐒𝐇𝐎𝐔𝐑𝐎𝐕_𝐁𝐎𝐓" },
    { timer: "10:00:00", message: "🕙 10:00 AM ...𝐒𝐇𝐎𝐔𝐑𝐎𝐕_𝐁𝐎𝐓" },
    { timer: "11:00:00", message: "🕚 11:00 AM ...𝐒𝐇𝐎𝐔𝐑𝐎𝐕_𝐁𝐎𝐓" },
    { timer: "12:00:00", message: "🕛 12:00 PM ...𝐒𝐇𝐎𝐔𝐑𝐎𝐕_𝐁𝐎𝐓" },
    { timer: "13:00:00", message: "🕐 1:00 PM ...𝐒𝐇𝐎𝐔𝐑𝐎𝐕_𝐁𝐎𝐓" },
    { timer: "14:00:00", message: "🕑 2:00 PM ...𝐒𝐇𝐎𝐔𝐑𝐎𝐕_𝐁𝐎𝐓" },
    { timer: "15:00:00", message: "🕒 3:00 PM ...𝐒𝐇𝐎𝐔𝐑𝐎𝐕_𝐁𝐎𝐓" },
    { timer: "16:00:00", message: "🕓 4:00 PM ...𝐒𝐇𝐎𝐔𝐑𝐎𝐕_𝐁𝐎𝐓" },
    { timer: "17:00:00", message: "🕔 5:00 PM ...𝐒𝐇𝐎𝐔𝐑𝐎𝐕_𝐁𝐎𝐓" },
    { timer: "18:00:00", message: "🕕 6:00 PM ...𝐒𝐇𝐎𝐔𝐑𝐎𝐕_𝐁𝐎𝐓" },
    { timer: "19:00:00", message: "🕖 7:00 PM ...𝐒𝐇𝐎𝐔𝐑𝐎𝐕_𝐁𝐎𝐓" },
    { timer: "20:00:00", message: "🕗 8:00 PM ...𝐒𝐇𝐎𝐔𝐑𝐎𝐕_𝐁𝐎𝐓" },
    { timer: "21:00:00", message: "🕘 9:00 PM ...𝐒𝐇𝐎𝐔𝐑𝐎𝐕_𝐁𝐎𝐓" },
    { timer: "22:00:00", message: "🕙 10:00 PM ...𝐒𝐇𝐎𝐔𝐑𝐎𝐕_𝐁𝐎𝐓" }
  ],

  onLoad: async function ({ api }) {
    // check every second
    setInterval(async () => {
      try {
        // 🇧🇩 Bangladesh time (UTC +6)
        const now = new Date(Date.now() + 6 * 60 * 60 * 1000)
          .toISOString()
          .substr(11, 8);

        const scheduled = module.exports.messages.find(m => m.timer === now);
        if (!scheduled) return;

        const todayKey = `${now}-${new Date().toDateString()}`;
        if (sentToday[todayKey]) return;
        sentToday[todayKey] = true;

        // GoatBot thread list
        const threads = global.db?.allThreadData || [];

        for (const thread of threads) {
          if (thread.threadID) {
            api.sendMessage(scheduled.message, thread.threadID);
          }
        }

      } catch (err) {
        console.log("[AUTOTIME ERROR]", err.message);
      }
    }, 1000);
  }
};