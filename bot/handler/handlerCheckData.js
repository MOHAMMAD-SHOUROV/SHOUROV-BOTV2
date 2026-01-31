const { db, utils, GoatBot } = global;
const { config } = GoatBot;
const { log, getText } = utils;
const { creatingThreadData, creatingUserData } = global.client.database;

module.exports = async function (usersData, threadsData, event) {
  const { threadID } = event;

  // ✅ STRONG senderID detect (group + inbox + reply)
  const senderID =
    event.senderID ||
    event.userID ||
    event.author ||
    (event.messageReply && event.messageReply.senderID);

  // ———————————— CHECK THREAD DATA ———————————— //
  if (threadID) {
    try {
      if (global.temp.createThreadDataError.includes(threadID)) return;

      const finding = creatingThreadData.find(t => t.threadID == threadID);
      if (!finding) {
        if (db.allThreadData.some(t => t.threadID == threadID)) return;

        const threadData = await threadsData.create(threadID);
        log.info(
          "DATABASE",
          `New Thread: ${threadID} | ${threadData.threadName} | ${config.database.type}`
        );
      } else {
        await finding.promise;
      }
    } catch (err) {
      if (err.name !== "DATA_ALREADY_EXISTS") {
        global.temp.createThreadDataError.push(threadID);
        log.err(
          "DATABASE",
          getText("handlerCheckData", "cantCreateThread", threadID),
          err
        );
      }
    }
  }

  // ———————————— CHECK USER DATA ———————————— //
  if (senderID) {
    try {
      const finding = creatingUserData.find(u => u.userID == senderID);
      if (!finding) {
        if (db.allUserData.some(u => u.userID == senderID)) return;

        const userData = await usersData.create(senderID);
        log.info(
          "DATABASE",
          `New User: ${senderID} | ${userData.name} | ${config.database.type}`
        );
      } else {
        await finding.promise;
      }
    } catch (err) {
      if (err.name !== "DATA_ALREADY_EXISTS") {
        log.err(
          "DATABASE",
          getText("handlerCheckData", "cantCreateUser", senderID),
          err
        );
      }
    }
  }
};