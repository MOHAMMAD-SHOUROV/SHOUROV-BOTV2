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

function getText(type, reason, time, targetID, lang) {
    const utils = global.utils;
    if (type == "userBanned")
        return utils.getText({ lang, head: "handlerEvents" }, "userBanned", reason, time, targetID);
    else if (type == "threadBanned")
        return utils.getText({ lang, head: "handlerEvents" }, "threadBanned", reason, time, targetID);
    else if (type == "onlyAdminBox")
        return utils.getText({ lang, head: "handlerEvents" }, "onlyAdminBox");
    else if (type == "onlyAdminBot")
        return utils.getText({ lang, head: "handlerEvents" }, "onlyAdminBot");
}

function replaceShortcutInLang(text, prefix, commandName) {
    return text
        .replace(/\{(?:p|prefix)\}/g, prefix)
        .replace(/\{(?:n|name)\}/g, commandName)
        .replace(/\{pn\}/g, `${prefix}${commandName}`);
}

function getRoleConfig(utils, command, isGroup, threadData, commandName) {
    let roleConfig;
    if (utils.isNumber(command.config.role)) {
        roleConfig = { onStart: command.config.role };
    } else if (typeof command.config.role == "object" && !Array.isArray(command.config.role)) {
        if (!command.config.role.onStart) command.config.role.onStart = 0;
        roleConfig = command.config.role;
    } else {
        roleConfig = { onStart: 0 };
    }

    if (isGroup)
        roleConfig.onStart = threadData.data.setRole?.[commandName] ?? roleConfig.onStart;

    for (const key of ["onChat", "onStart", "onReaction", "onReply"]) {
        if (roleConfig[key] == undefined)
            roleConfig[key] = roleConfig.onStart;
    }

    return roleConfig;
}

function isBannedOrOnlyAdmin(userData, threadData, senderID, threadID, isGroup, commandName, message, lang) {
    const config = global.GoatBot.config;
    const { adminBot, hideNotiMessage } = config;

    const infoBannedUser = userData.banned;
    if (infoBannedUser.status == true) {
        const { reason, date } = infoBannedUser;
        if (hideNotiMessage.userBanned == false)
            message.reply(getText("userBanned", reason, date, senderID, lang));
        return true;
    }

    if (
        config.adminOnly.enable == true &&
        !adminBot.includes(senderID) &&
        !config.adminOnly.ignoreCommand.includes(commandName)
    ) {
        if (hideNotiMessage.adminOnly == false)
            message.reply(getText("onlyAdminBot", null, null, null, lang));
        return true;
    }

    if (isGroup == true) {
        if (
            threadData.data.onlyAdminBox === true &&
            !threadData.adminIDs.includes(senderID) &&
            !(threadData.data.ignoreCommanToOnlyAdminBox || []).includes(commandName)
        ) {
            if (!threadData.data.hideNotiMessageOnlyAdminBox)
                message.reply(getText("onlyAdminBox", null, null, null, lang));
            return true;
        }

        const infoBannedThread = threadData.banned;
        if (infoBannedThread.status == true) {
            const { reason, date } = infoBannedThread;
            if (hideNotiMessage.threadBanned == false)
                message.reply(getText("threadBanned", reason, date, threadID, lang));
            return true;
        }
    }
    return false;
}

function createGetText2(langCode, pathCustomLang, prefix, command) {
    const commandType = command.config.countDown ? "command" : "command event";
    const commandName = command.config.name;
    let customLang = {};
    let getText2 = () => { };
    if (fs.existsSync(pathCustomLang))
        customLang = require(pathCustomLang)[commandName]?.text || {};
    if (command.langs || customLang || {}) {
        getText2 = function (key, ...args) {
            let lang = command.langs?.[langCode]?.[key] || customLang[key] || "";
            lang = replaceShortcutInLang(lang, prefix, commandName);
            for (let i = args.length - 1; i >= 0; i--)
                lang = lang.replace(new RegExp(`%${i + 1}`, "g"), args[i]);
            return lang || `❌ Can't find text on language "${langCode}" for ${commandType} "${commandName}" with key "${key}"`;
        };
    }
    return getText2;
}

// --------------------- SMART MENTION RESOLVER ---------------------
async function resolveMentionFromBody(body, threadID, api, targetName = null) {
    if (!body && !targetName) return null;
    try {
        let searchText = targetName;
        if (!searchText) {
            const match = body.match(/^\/(\w+)\s+(.+)/i);
            if (match) searchText = match[2].trim();
            else return null;
        }
        searchText = searchText.replace(/^@/, "").trim();
        if (!searchText) return null;
        const info = await api.getThreadInfo(threadID);
        const userInfo = info.userInfo || [];
        const nicknames = info.nicknames || {};
        const searchTextLower = searchText.toLowerCase();
        const searchWords = searchTextLower.split(/\s+/).filter(w => w.length > 0);
        const matches = [];
        for (const user of userInfo) {
            if (!user.name) continue;
            const userName = user.name.toLowerCase();
            const userNick = nicknames[user.id] ? nicknames[user.id].toLowerCase() : "";
            let score = 0;
            if (userName === searchTextLower) score += 1000;
            if (userNick && userNick === searchTextLower) score += 900;
            if (userName.includes(searchTextLower)) score += 600;
            if (score > 0) matches.push({ id: user.id, name: user.name, score: score });
        }
        matches.sort((a, b) => b.score - a.score);
        return matches.length > 0 ? matches[0].id : null;
    } catch (error) { return null; }
}

module.exports = function (api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData) {
    return async function (event, message) {
        const { utils, client, GoatBot } = global;
        const { getPrefix, removeHomeDir, log, getTime } = utils;
        const { config, configCommands: { envGlobal, envCommands, envEvents } } = GoatBot;
        const { autoRefreshThreadInfoFirstTime } = config.database;
        let { hideNotiMessage = {} } = config;

        const { body, messageID, threadID, isGroup } = event;
        if (!threadID) return;

        const senderID = event.userID || event.senderID || event.author;
        let threadData = global.db.allThreadData.find(t => t.threadID == threadID);
        let userData = global.db.allUserData.find(u => u.userID == senderID);

        if (!userData && !isNaN(senderID)) userData = await usersData.create(senderID);
        if (!threadData && !isNaN(threadID)) {
            if (global.temp.createThreadDataError.includes(threadID)) return;
            threadData = await threadsData.create(threadID);
            global.db.receivedTheFirstMessage[threadID] = true;
        } else {
            if (autoRefreshThreadInfoFirstTime === true && !global.db.receivedTheFirstMessage[threadID]) {
                global.db.receivedTheFirstMessage[threadID] = true;
                await threadsData.refreshInfo(threadID);
            }
        }

        if (typeof threadData.settings.hideNotiMessage == "object")
            hideNotiMessage = threadData.settings.hideNotiMessage;

        const prefix = getPrefix(threadID);
        const role = getRole(threadData, senderID);
        const langCode = threadData.data.lang || config.language || "en";

        const parameters = {
            api, usersData, threadsData, message, event, userModel, threadModel, prefix, dashBoardModel, globalModel, dashBoardData, globalData, envCommands, envEvents, envGlobal, role,
            removeCommandNameFromBody: (body_, prefix_, commandName_) => body_.replace(new RegExp(`^${prefix_}(\\s+|)${commandName_}`, "i"), "").trim(),
            resolveMentionFromBody: (bodyText, targetName) => resolveMentionFromBody(bodyText, threadID, api, targetName)
        };

        function createMessageSyntaxError(commandName) {
            message.SyntaxError = async function () {
                return await message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "commandSyntaxError", prefix, commandName));
            };
        }

        let isUserCallCommand = false;

        async function onStart() {
            if (!body || !body.startsWith(prefix)) return;

            const dateNow = Date.now();
            const args = body.slice(prefix.length).trim().split(/ +/);
            let commandName = args.shift().toLowerCase();
            let command = GoatBot.commands.get(commandName) || GoatBot.commands.get(GoatBot.aliases.get(commandName));

            if (command) commandName = command.config.name;

            // ——————————————— COMMAND FINDER ——————————————— //
            if (!command) {
                if (!hideNotiMessage.commandNotFound) {
                    if (!commandName) return;
                    const allCommands = [...new Set([...Array.from(GoatBot.commands.keys()), ...Array.from(GoatBot.aliases.keys())])];
                    const levenshtein = (a, b) => {
                        const res = Array.from({ length: a.length + 1 }, () => []);
                        for (let i = 0; i <= a.length; i++) res[i][0] = i;
                        for (let j = 0; j <= b.length; j++) res[0][j] = j;
                        for (let i = 1; i <= a.length; i++) {
                            for (let j = 1; j <= b.length; j++) {
                                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                                res[i][j] = Math.min(res[i - 1][j] + 1, res[i][j - 1] + 1, res[i - 1][j - 1] + cost);
                            }
                        }
                        return res[a.length][b.length];
                    };
                    const matches = allCommands
                        .map(cmd => ({ name: cmd, dist: levenshtein(commandName, cmd) }))
                        .filter(m => m.dist <= 3)
                        .sort((a, b) => a.dist - b.dist)
                    .slice(0, 5);

                    let response = `✦━━━━━━━━━━━━━━━━━✦\n🎀 𝐓𝐡𝐞 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐲𝐨𝐮 𝐚𝐫𝐞 𝐮𝐬𝐢𝐧𝐠 𝐝𝐨𝐞𝐬 𝐧𝐨𝐭 𝐞𝐱𝐢𝐬𝐭.\n\n➥ 𝐃𝐢𝐝 𝐲𝐨𝐮 𝐦𝐞𝐚𝐧 :`;
                    if (matches.length > 0) matches.forEach((m, index) => { response += `\n${index + 1}. ${prefix}${m.name}`; });
                    else response += `\n(No similar commands found)`;
                    response += `\n\n💡 Use "${prefix}help" to see all commands.\n✦━━━━━━━━━━━━━━━━━✦`;
                    return await message.reply(response);
                }
                return true;
            }

            if (isBannedOrOnlyAdmin(userData, threadData, senderID, threadID, isGroup, commandName, message, langCode))
                return;

            // ——————————————— PREMIUM CHECK ——————————————— //
            if (command.config?.isPremium === true) {
                const premiumConfig = global.GoatBot.config.premium || {};
                const premiumList = Array.isArray(premiumConfig) ? premiumConfig : (premiumConfig.users || []);
                const isPremiumUser = premiumList.includes(senderID) || userData?.premium?.isPremium === true;

                if (!isPremiumUser) {
                    return await message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "onlyPremium", commandName));
                }
            }

            const roleConfig = getRoleConfig(utils, command, isGroup, threadData, commandName);
            if (roleConfig.onStart > role) {
                if (!hideNotiMessage.needRoleToUseCmd) {
                    if (roleConfig.onStart == 1) return await message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "onlyAdmin", commandName));
                    if (roleConfig.onStart == 2) return await message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "onlyAdminBot2", commandName));
                }
                return true;
            }

            if (!client.countDown[commandName]) client.countDown[commandName] = {};
            const timestamps = client.countDown[commandName];
            let getCoolDown = command.config.countDown || 1;
            if (timestamps[senderID] && (dateNow < timestamps[senderID] + (getCoolDown * 1000))) {
                return await message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "waitingForCommand", (((timestamps[senderID] + (getCoolDown * 1000)) - dateNow) / 1000).toString().slice(0, 3)));
            }

            isUserCallCommand = true;
            try {
                const analytics = await globalData.get("analytics", "data", {});
                analytics[commandName] = (analytics[commandName] || 0) + 1;
                await globalData.set("analytics", analytics, "data");

                createMessageSyntaxError(commandName);
                const getText2 = createGetText2(langCode, `${process.cwd()}/languages/cmds/${langCode}.js`, prefix, command);
                await command.onStart({ ...parameters, args, commandName, getLang: getText2 });
                timestamps[senderID] = dateNow;
                log.info("CALL COMMAND", `${commandName} | ${userData.name} | ${senderID} | ${threadID}`);
            } catch (err) {
                log.err("CALL COMMAND", `Error in ${commandName}`, err);
                return await message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "errorOccurred", getTime("DD/MM/YYYY HH:mm:ss"), commandName, removeHomeDir(err.stack?.split("\n").slice(0, 5).join("\n") || JSON.stringify(err))));
            }
        }

        async function onChat() {
            const allOnChat = GoatBot.onChat || [];
            for (const key of allOnChat) {
                const command = GoatBot.commands.get(key);
                if (!command) continue;
                try { await command.onChat({ ...parameters, isUserCallCommand, args: body?.split(/ +/) || [], commandName: command.config.name }); } catch (err) { }
            }
        }

        async function onReply() {
            if (!event.messageReply) return;
            const Reply = GoatBot.onReply.get(event.messageReply.messageID);
            if (!Reply) return;
const command = GoatBot.commands.get(Reply.commandName);
            if (!command) return;
            try { await command.onReply({ ...parameters, Reply, args: body?.split(/ +/) || [], commandName: Reply.commandName }); } catch (err) { }
        }

        async function onReaction() {
            const Reaction = GoatBot.onReaction.get(messageID);
            if (!Reaction) return;
            const command = GoatBot.commands.get(Reaction.commandName);
            if (!command) return;
            try { await command.onReaction({ ...parameters, Reaction, args: [], commandName: Reaction.commandName }); } catch (err) { }
        }

        async function handlerEvent() {
            for (const [key, getEvent] of GoatBot.eventCommands.entries()) {
                try { await getEvent.onStart({ ...parameters, commandName: getEvent.config.name }); } catch (err) { }
            }
        }

        async function onEvent() {
            for (const key of (GoatBot.onEvent || [])) {
                const command = GoatBot.commands.get(key);
                if (command) try { await command.onEvent({ ...parameters, commandName: command.config.name }); } catch (err) { }
            }
        }

        return { onStart, onChat, onReply, onReaction, handlerEvent, onEvent, onAnyEvent: async () => {}, onFirstChat: async () => {}, presence: async () => {}, read_receipt: async () => {}, typ: async () => {} };
    };
};