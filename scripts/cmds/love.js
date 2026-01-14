const jimp = require("jimp");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "love",
    aliases: ["love2"],
    role: 0,
    category: "fun",
    shortDescription: "Love photo"
  },

  onStart: async function ({ api,message,event,args }) {
    const mention = Object.keys(event.mentions);

    if (mention.length === 0)
      return api.sendMessage(
        "💚 যাকে ভালোবাসো তাকে mention করো",
        event.threadID,
        event.messageID
      );


      const one = event.senderID;
      const two = mention[0];

      const path = await makeLove(one, two);

      api.sendMessage(
        {
          body: "ইগো আর ভালোবাসা লড়াই করলে ভালোবাসাই হেরে যায় 💔🥀",
          attachment: fs.createReadStream(path)
        },
        event.threadID,
        () => fs.unlinkSync(path),
        event.messageID
      );

    } catch (e) {
      api.sendMessage(
        "❌ Love image তৈরি করা যায়নি",
        event.threadID,
        event.messageID
      );
    }
  }
};

async function makeLove(one, two) {
  const img = await jimp.read("https://i.imgur.com/LjpG3CW.jpeg");

  const av1 = await jimp.read(
    `https://graph.facebook.com/${one}/picture?width=512&height=512`
  );
  const av2 = await jimp.read(
    `https://graph.facebook.com/${two}/picture?width=512&height=512`
  );

  av1.circle().resize(350, 350);
  av2.circle().resize(350, 350);

  img.resize(1200, 800)
    .composite(av1, 100, 200)
    .composite(av2, 700, 200);

  const path = "love.png";
  await img.writeAsync(path);
  return path;
}