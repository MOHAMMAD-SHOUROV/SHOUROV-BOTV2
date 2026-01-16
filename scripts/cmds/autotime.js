let sentToday = {};

module.exports = {
  config: {
    name: "autotime",
    version: "10.02",
    author: "Alihsan Shourov",
    role: 0,
    category: "group"
  },

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
    { timer: "12:00:00", message: "🕛 12:00 PM ...𝐒𝐇𝐎𝐔𝐑𝐎𝐕_𝐁𝐎𝐓" }
  ],

  onStart: async function ({ api }) {
    setInterval(() => {
      try {
        const now = new Date(Date.now() + 6 * 60 * 60 * 1000)
          .toISOString()
          .substr(11, 8);

        const scheduled = this.messages.find(m => m.timer === now);
        if (!scheduled) return;

        const key = `${now}-${new Date().toDateString()}`;
        if (sentToday[key]) return;
        sentToday[key] = true;

        const threads = global.db?.allThreadData || [];
        for (const t of threads) {
          if (t.threadID) api.sendMessage(scheduled.message, t.threadID);
        }
      } catch (e) {
        console.log("[AUTOTIME ERROR]", e.message);
      }
    }, 1000);
  },

  run: async () => {}
};