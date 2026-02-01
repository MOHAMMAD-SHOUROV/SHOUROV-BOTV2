'use strict';

const fs = require("fs-extra");

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

    // 🛡️ SAFETY (MOST IMPORTANT)
    if (!event.mentions) event.mentions = {};
    if (!event.messageReply) event.messageReply = null;

    const { utils, GoatBot } = global;
    const { getPrefix, log } = utils;

    const { body, threadID, isGroup } = event;
    if (!threadID || !body) return;

    // ✅ STRONG senderID FIX (inbox + group)
    const senderID =
      event.senderID ||
      event.userID ||
      event.author ||
      threadID;

    let threadData =
      global.db.allThreadData.find(t => t.threadID == threadID) ||
      (await threadsData.create(threadID));

    let userData =
      global.db.allUserData.find(u => u.userID == senderID) ||
      (await usersData.create(senderID));

    const prefix = getPrefix(threadID);
    const role = getRole(threadData, senderID);

    // ================= COMMAND HANDLER =================
    async function onStart() {
      let args = [];
      let commandName = null;
      let command = null;

      // ✅ PREFIX COMMAND (mention-safe)
      if (body.startsWith(prefix)) {
        const withoutPrefix = body.slice(prefix.length).trim();
        const split = withoutPrefix.split(/\s+/);

        commandName = split.shift()?.toLowerCase();
        args = split;
      }

      // ❌ no prefix → ignore
      if (!commandName) return;

      command =
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
        message.reply("❌ Command error occurred.");
      }
    }

    // ================= REPLY HANDLER =================
    async function onReply() {
      if (!event.messageReply) return;

      const Reply = GoatBot.onReply.get(event.messageReply.messageID);
      if (!Reply) return;

      const command = GoatBot.commands.get(Reply.commandName);
      if (!command || !command.onReply) return;

      try {
        await command.onReply({
          api,
          message,
          event,
          Reply
        });
      } catch (e) {
        log.err("REPLY ERROR", e);
      }
    }

    return {
      onStart,
      onReply,
      onChat: async () => {},
      onReaction: async () => {},
      onAnyEvent: async () => {}
    };
  };
};