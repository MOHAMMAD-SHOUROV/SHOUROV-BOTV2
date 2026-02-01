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

    // 🔐 HARD SAFETY (MENTION + REPLY FIX)
    if (!event.mentions || typeof event.mentions !== "object") {
      event.mentions = {};
    }
    if (!event.messageReply || typeof event.messageReply !== "object") {
      event.messageReply = null;
    }

    const { utils, client, GoatBot } = global;
    const { getPrefix, log } = utils;

    const { body, threadID, isGroup } = event;
    if (!threadID) return;

    // ✅ STRONG senderID FIX (group + inbox + reply)
    const senderID =
      event.senderID ||
      event.userID ||
      event.author ||
      event.threadID;

    // ✅ Ensure DB data
    let threadData =
      global.db.allThreadData.find(t => t.threadID == threadID);
    if (!threadData) threadData = await threadsData.create(threadID);

    let userData =
      global.db.allUserData.find(u => u.userID == senderID);
    if (!userData) userData = await usersData.create(senderID);

    const prefix = getPrefix(threadID);
    const role = getRole(threadData, senderID);

    /* ================= COMMAND START ================= */

    async function onStart() {
      if (!body || typeof body !== "string") return;

      let args = [];
      let commandName;
      let command;

      // ✅ PREFIX COMMAND
      if (body.startsWith(prefix)) {
        args = body.slice(prefix.length).trim().split(/\s+/);
        commandName = args.shift()?.toLowerCase();
      }
      // ✅ NO PREFIX COMMAND
      else {
        const firstWord = body.split(/\s+/)[0].toLowerCase();
        const cmd = GoatBot.commands.get(firstWord);
        if (cmd && cmd.config?.prefix === false) {
          args = body.split(/\s+/);
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
          usersData,
          threadsData
        });

        log.info("CMD", `${commandName} | ${senderID}`);
      } catch (e) {
        log.err("CMD ERROR", e);
        message.reply("❌ Error occurred while running command.");
      }
    }

    /* ================= REPLY ================= */

    async function onReply() {
      if (!event.messageReply) return;

      const Reply = GoatBot.onReply.get(event.messageReply.messageID);
      if (!Reply) return;

      const command = GoatBot.commands.get(Reply.commandName);
      if (!command || typeof command.onReply !== "function") return;

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