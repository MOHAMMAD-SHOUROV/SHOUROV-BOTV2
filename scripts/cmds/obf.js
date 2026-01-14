const JavaScriptObfuscator = require("javascript-obfuscator");

module.exports = {
  config: {
    name: "obf",
    role: 2, // only admin
    category: "tools",
    author: "Shourov",
    shortDescription: "JavaScript code obfuscator",
    guide: {
      en: "{pn} <js code>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const code = args.join(" ");

    if (!code) {
      return api.sendMessage(
        "❌ Usage:\nobf <your javascript code>",
        event.threadID,
        event.messageID
      );
    }

    try {
      const obfuscated = JavaScriptObfuscator.obfuscate(code, {
        compact: true,
        controlFlowFlattening: true,
        stringArray: true,
        stringArrayEncoding: ["base64"],
        deadCodeInjection: false,
        selfDefending: false,
        renameGlobals: false
      }).getObfuscatedCode();

      if (obfuscated.length > 18000) {
        return api.sendMessage(
          "⚠️ Code too long to send in Messenger",
          event.threadID,
          event.messageID
        );
      }

      api.sendMessage(
        {
          body: "🔐 Obfuscated Code:\n\n" + obfuscated
        },
        event.threadID,
        event.messageID
      );

    } catch (err) {
      api.sendMessage(
        "❌ Obfuscation failed:\n" + err.message,
        event.threadID,
        event.messageID
      );
    }
  }
};