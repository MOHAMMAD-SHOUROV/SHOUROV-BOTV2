const fs = require("fs");
const path = require("path");
const fs = require('fs');

module.exports = {
	config: {
		name: "file",
		aliases: ["files"],
		version: "1.0",
     prefix: false,
		author: "Mahir Tahsan",
		countDown: 5,
		role: 0,
		shortDescription: "Send bot script",
		longDescription: "Send bot specified file ",
		category: "𝗢𝗪𝗡𝗘𝗥",
		guide: "{pn} file name. Ex: .{pn} filename"
	},

	onStart: async function ({ message, args, api, event }) {
		const permission = ["100071971474157",];
		if (!permission.includes(event.senderID)) {
			return api.sendMessage(" You don't have permission to use this command. 🐤", event.threadID, event.messageID);
		}

		const fileName = args[0];
		if (!fileName) {
			return api.sendMessage("Please provide a file name.", event.threadID, event.messageID);
		}

		const filePath = __dirname + `/${fileName}.js`;
		if (!fs.existsSync(filePath)) {
			return api.sendMessage(`File not found: ${fileName}.js`, event.threadID, event.messageID);
		}

		const fileContent = fs.readFileSync(filePath, 'utf8');
		api.sendMessage({ body: fileContent }, event.threadID);
	}
};uto audio reply",
    category: "auto"
  },

  handleEvent: async function ({ api, event }) {
    try {
      const { threadID, messageID, body } = event;
      if (!body) return;

      const text = body.toLowerCase();

      const triggers = ["🤭", "🙈", "🙊", "🤫"];

      if (!triggers.some(t => text.includes(t))) return;

      const audioPath = path.join(__dirname, "shourov", "sorom.mp3");

      if (!fs.existsSync(audioPath)) {
        console.log("[angry] Audio not found:", audioPath);
        return;
      }

      api.sendMessage(
        {
          body: "আঁমিঁ বলুঁম্ না — আমার শরম লাগে 😳",
          attachment: fs.createReadStream(audioPath)
        },
        threadID,
        messageID
      );

    } catch (e) {
      console.error("[angry] error:", e.message);
    }
  },

  // loader এর জন্য দরকার
  run: async function () {}
};
