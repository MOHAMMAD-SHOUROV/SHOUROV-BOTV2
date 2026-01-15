module.exports = {
    config: {
        name: "vip",
        version: "1.2",
        author: "Mahabub",
        role: 2, // only admin bot
        countDown: 5,
        shortDescription: {
            en: "🌟 VIP Management with stylish fonts"
        },
        longDescription: {
            en: "Manage VIP users with cool unicode fonts. Only the bot owner can use this command."
        },
        category: "admin",
        guide: {
            en: `💡 Usage:
{pn} add <userID> - Add a VIP
{pn} remove <userID> - Remove a VIP
{pn} list - Show VIPs in fancy style`
        }
    },
    onStart: async function ({ message, args, event, utils }) {
        const allowedUser = "100014754734049"; // only this user can run the command
        if (event.senderID != allowedUser)
            return message.reply("❌ You are not authorized to use this command.");

        if (!global.GoatBot.config.vip) global.GoatBot.config.vip = [];
        const vipUsers = global.GoatBot.config.vip;

        const subCommand = args[0]?.toLowerCase();
        const userID = args[1];

        if (!subCommand)
            return message.reply("❌ Please provide a subcommand: add/remove/list");

        // Example font style function (unicode)
        function fancyText(text) {
            const fancyMap = {
                "A": "𝐀", "B": "𝐁", "C": "𝐂", "D": "𝐃", "E": "𝐄", "F": "𝐅", "G": "𝐆",
                "H": "𝐇", "I": "𝐈", "J": "𝐉", "K": "𝐊", "L": "𝐋", "M": "𝐌", "N": "𝐍",
                "O": "𝐎", "P": "𝐏", "Q": "𝐐", "R": "𝐑", "S": "𝐒", "T": "𝐓", "U": "𝐔",
                "V": "𝐕", "W": "𝐖", "X": "𝐗", "Y": "𝐘", "Z": "𝐙",
                "a": "𝐚", "b": "𝐛", "c": "𝐜", "d": "𝐝", "e": "𝐞", "f": "𝐟", "g": "𝐠",
                "h": "𝐡", "i": "𝐢", "j": "𝐣", "k": "𝐤", "l": "𝐥", "m": "𝐦", "n": "𝐧",
                "o": "𝐨", "p": "𝐩", "q": "𝐪", "r": "𝐫", "s": "𝐬", "t": "𝐭", "u": "𝐮",
                "v": "𝐯", "w": "𝐰", "x": "𝐱", "y": "𝐲", "z": "𝐳",
                "0": "𝟎", "1": "𝟏", "2": "𝟐", "3": "𝟑", "4": "𝟒", "5": "𝟓",
                "6": "𝟔", "7": "𝟕", "8": "𝟖", "9": "𝟗"
            };
            return text.split("").map(c => fancyMap[c] || c).join("");
        }

        switch (subCommand) {
            case "add":
                if (!userID) return message.reply("❌ Please provide a userID to add.");
                if (vipUsers.includes(userID)) return message.reply("⚠ This user is already VIP.");
                vipUsers.push(userID);
                return message.reply(
                    `✨🎉 VIP ACTIVATED! 🎉✨\n\n✅ User **${fancyText(userID)}** added to VIP list!\n🌟 Total VIPs: ${fancyText(String(vipUsers.length))}`
                );

            case "remove":
                if (!userID) return message.reply("❌ Please provide a userID to remove.");
                if (!vipUsers.includes(userID)) return message.reply("⚠ This user is not VIP.");
                global.GoatBot.config.vip = vipUsers.filter(id => id !== userID);
                return message.reply(
                    `🗑️ VIP REMOVED! 🗑️\n\n❌ User **${fancyText(userID)}** removed from VIP list!\n🌟 Remaining VIPs: ${fancyText(String(global.GoatBot.config.vip.length))}`
                );

            case "list":
                if (!vipUsers.length) return message.reply("ℹ️ VIP list is empty.");
                return message.reply(
                    `🌟🌟🌟 VIP LIST 🌟🌟🌟\n\n` +
                    vipUsers.map((id, i) => `🔹 ${fancyText(String(i + 1))}. ${fancyText(id)}`).join("\n") +
                    `\n\n💎 Total VIPs: ${fancyText(String(vipUsers.length))}`
                );

            default:
                return message.reply("❌ Invalid subcommand. Use: add/remove/list");
        }
    }
};