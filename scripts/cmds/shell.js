const { exec } = require("child_process");

module.exports.config = {
    name: "shell",
    aliases: ["sh"],
    version: "1.0",
    author: "Dipto",
    role: 2,
    description: "Execute shell commands",
    category: "system",
    guide: "{pn} <command>",
    coolDowns: 5,
    premium: false
};

module.exports.onStart = async ({ message, args }) => {
    if (!args.length) {
        return message.reply("❌ | Please provide a command to execute.");
    }

    const command = args.join(" ");

    exec(command, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
            return message.reply(`❌ | Error: ${error.message}`);
        }
        if (stderr) {
            return message.reply(`⚠️ | Shell Error:\n${stderr}`);
        }

        const output = stdout || "✅ | Command executed successfully with no output.";
        // prevent sending too large output
        if (output.length > 4000) {
            return message.reply("⚠️ | Output too long to display. Try redirecting to a file.");
        }
        message.reply(output);
    });
};