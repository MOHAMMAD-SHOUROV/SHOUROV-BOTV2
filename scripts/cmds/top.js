const axios = require("axios");

module.exports = {
  config: {
    name: "top",
    version: "1.6",
    author: "MOHAMMAD-BADOL",
    credits: "MOHAMMAD-BADOL",
    role: 0,
    shortDescription: "Top EXP users",
    longDescription: "Shows the top users with the highest experience points.",
    category: "group",
    guide: "{pn}",
    prefix: true,
    cooldowns: 5
  },

  onStart: async function ({ message, usersData }) {
    try {
      const allUsers = await usersData.getAll();
      const usersWithExp = allUsers
        .filter(user => Number(user.exp || 0) > 0)
        .map(user => ({ ...user, exp: Number(user.exp || 0) }))
        .sort((a, b) => b.exp - a.exp)
        .slice(0, 10);

      if (usersWithExp.length === 0) {
        return message.reply("❌ কোনো ইউজারের EXP পাওয়া যায়নি।");
      }

      const topUsersList = usersWithExp.map((user, index) => {
        const name = user.name || user.userID || "Unknown";
        return `${index + 1}. ${name}: ${user.exp} EXP`;
      });

      const messageText = `👑 𝐓𝐨𝐩 ${usersWithExp.length} 𝐋𝐞𝐯𝐞𝐥 𝐔𝐩 𝐔𝐬𝐞𝐫𝐬 📌\n\n${topUsersList.join("\n")}`;

      // ---------- use global.utils like upx ----------
      let attachment = null;
      const imageUrl = "https://i.imgur.com/QD7VCA1.jpeg";

      if (global.utils && typeof global.utils.getStreamFromURL === "function") {
        try {
          attachment = await global.utils.getStreamFromURL(imageUrl);
        } catch {}
      }

      if (attachment) {
        await message.reply({ body: messageText, attachment });
      } else {
        await message.reply(messageText + "\n⚠ ছবি লোড করা যায়নি।");
      }

    } catch (error) {
      console.error("❌ Error in 'top' command:", error);
      await message.reply("⚠️ কমান্ড চালাতে সমস্যা হচ্ছে, অনুগ্রহ করে পরে আবার চেষ্টা করুন।");
    }
  }
};