const fs = require("fs-extra");
const nullAndUndefined = [undefined, null];

function getType(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1);
}

function getRole(threadData, senderID) {
  const adminBot = global.GoatBot.config.adminBot || [];
  if (!senderID) return 0;
  const adminBox = threadData ? threadData.adminIDs || [] : [];
  return adminBot.includes(senderID) ? 2 : adminBox.includes(senderID) ? 1 : 0;
}

// ✅ VIP check
function isVip(senderID) {
  const vipUsers = global.GoatBot.config.vip || [];
  return vipUsers.includes(senderID);
}

function replaceShortcutInLang(text, prefix, commandName) {
  return text
    .replace(/\{(?:p|prefix)\}/g, prefix)
    .replace(/\{(?:n|name)\}/g, commandName)
    .replace(/\{pn\}/g, `${prefix}${commandName}`);
}

function getRoleConfig(utils, command, isGroup, threadData, commandName) {
  let roleConfig = { onStart: 0 };

  if (utils.isNumber(command.config.role)) {
    roleConfig.onStart = command.config.role;
  } else if (typeof command.config.role === "object") {
    roleConfig = { ...command.config.role };
  }

  if (isGroup)
    roleConfig.onStart =
      threadData.data.setRole?.[commandName] ?? roleConfig.onStart;

  for (const k of ["onChat", "onStart", "onReply", "onReaction"]) {
    if (roleConfig[k] == null) roleConfig[k] = roleConfig.onStart;
  }

  return roleConfig;
}

module.exports = function (
  api,
  threadModel,
  userModel,
  dashBoardModel,
  globalModel,
  usersData,
  threadsData,
  dashBoardData,
  globalData
) {
  return async function (event, message) {
    // 🔒 SAFETY FIX (MOST IMPORTANT)
    if (!event.mentions) event.mentions = {};
    if (!event.messageReply) event.messageReply = null;

    const { utils, client, GoatBot } = global;
    const { getPrefix, log, getTime } = utils;

    const { body, threadID, isGroup } = event;
    if (!threadID) return;

    // ✅ STRONG senderID FIX (inbox + group + reply)
    const senderID =
      event.senderID ||
      event.userID ||
      event.author ||
      event.threadID;

    let threadData =
      global.db.allThreadData.find(t => t.threadID == threadID) ||
      (await threadsData.create(threadID));

    let userData =
      global.db.allUserData.find(u => u.userID == senderID) ||
      (await usersData.create(senderID));

    const prefix = getPrefix(threadID);
    const role = getRole(threadData, senderID);
    const langCode = threadData.data.lang || GoatBot.config.language || "en";

    async function onStart() {
      if (!body) return;

      let args, commandName, command;

      if (body.startsWith(prefix)) {
        args = body.slice(prefix.length).trim().split(/ +/);
        commandName = args.shift()?.toLowerCase();
      } else {
        const first = body.split(/ +/)[0].toLowerCase();
        const cmd = GoatBot.commands.get(first);
        if (cmd?.config.prefix === false) {
          args = body.split(/ +/);
          commandName = args.shift().toLowerCase();
          command = cmd;
        } else return;
      }

      command =
        command ||
        GoatBot.commands.get(commandName) ||
        GoatBot.commands.get(GoatBot.aliases.get(commandName));

      if (!command) {
        return message.reply(`❌ Command not found: ${commandName}`);
      }

      commandName = command.config.name;

      // 🔒 Disabled command
      if (GoatBot.config.disabledCommands?.includes(commandName))
        return message.reply("❌ This command is disabled.");

      const roleConfig = getRoleConfig(
        utils,
        command,
        isGroup,
        threadData,
        commandName
      );

      if (roleConfig.onStart === 4 && !isVip(senderID))
        return message.reply("❌ VIP only command.");

      if (roleConfig.onStart > role)
        return message.reply("❌ You don't have permission.");

      try {
        await command.onStart({
          api,
          message,
          event,
          args,
          commandName,
          usersData,
          threadsData
        });
        log.info("CMD", `${commandName} | ${senderID}`);
      } catch (e) {
        log.err("CMD ERROR", e);
        message.reply("❌ Error occurred.");
      }
    }

    async function onReply() {
      if (!event.messageReply) return;

      const Reply = GoatBot.onReply.get(event.messageReply.messageID);
      if (!Reply) return;

      const command = GoatBot.commands.get(Reply.commandName);
      if (!command) return;

      await command.onReply({
        api,
        message,
        event,
        Reply
      });
    }

    return {
      onStart,
      onReply,
      onChat: async () => {},
      onAnyEvent: async () => {},
      onReaction: async () => {},
      onEvent: async () => {},
      handlerEvent: async () => {},
      presence: async () => {},
      read_receipt: async () => {},
      typ: async () => {}
    };
  };
};
