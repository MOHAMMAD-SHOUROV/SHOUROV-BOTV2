const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "pin",
        aliases: ["pinterest"],
        version: "1.1",
        author: "Dipto",
        countDown: 15,
        role: 0,
        shortDescription: "Pinterest Image Search",
        longDescription: "Pinterest Image Search",
        category: "download",
        guide: {
            en: "{pn} query-count",
        },
    },

    onStart: async function ({ api, event, args }) {
        const queryAndCount = args.join(" ").split("-");
        const q = queryAndCount[0]?.trim();
        const count = queryAndCount[1]?.trim();

        if (!q || !count || isNaN(count)) {
            return api.sendMessage(
                "❌| Wrong format. Use: query-count (e.g., itachi-5)",
                event.threadID,
                event.messageID
            );
        }

        try {
            const w = await api.sendMessage("Please wait...", event.threadID);

            // Fetch data from the new API
            const response = await axios.get(
                `https://mahabub-pinterest-api.vercel.app/api/pin?search=${encodeURIComponent(q)}&count=${encodeURIComponent(count)}`
            );

            const data = response.data.data;

            if (!data || data.length === 0) {
                return api.sendMessage(
                    "❌ No images found for your query.",
                    event.threadID,
                    event.messageID
                );
            }

            const attachments = [];
            const totalImagesCount = Math.min(data.length, parseInt(count));

            for (let i = 0; i < totalImagesCount; i++) {
                const imgUrl = data[i];
                const imgResponse = await axios.get(imgUrl, { responseType: "arraybuffer" });
                const imgPath = path.join(__dirname, "dvassests", `${i + 1}.jpg`);
                await fs.outputFile(imgPath, imgResponse.data);
                attachments.push(fs.createReadStream(imgPath));
            }

            await api.unsendMessage(w.messageID);
            await api.sendMessage(
                {
                    body: `✅ | Here's your Pinterest images for "${q}"\n🐤 | Total Images Count: ${totalImagesCount}`,
                    attachment: attachments,
                },
                event.threadID,
                event.messageID
            );
        } catch (error) {
            console.error(error);
            await api.sendMessage(
                `❌ Error: ${error.message}`,
                event.threadID,
                event.messageID
            );
        }
    },
};