const { getTime, drive } = global.utils;

module.exports = {
  config: {
    name: "leave",
    version: "1.6-fixed",
    author: "NTKhang | fixed by Alihsan Shourov",
    category: "events"
  },

  langs: {
    en: {
      session1: "🌅 ᴍᴏʀɴɪɴɢ",
      session2: "☀️ ɴᴏᴏɴ",
      session3: "🌇 ᴀꜰᴛᴇʀɴᴏᴏɴ",
      session4: "🌙 ᴇᴠᴇɴɪɴɢ",
      leaveType1: "ʟᴇꜰᴛ ᴛʜᴇ ɢʀᴏᴜᴘ",
      leaveType2: "ᴡᴀꜱ ʀᴇᴍᴏᴠᴇᴅ ꜰʀᴏᴍ ᴛʜᴇ ɢʀᴏᴜᴘ",
      defaultLeaveMessage:
        "👋 Leave Event\n\n🧑 User: {userName}\n❌ Type: {type}\n💬 Group: {threadName}\n⏰ Time: {time}\n🌏 Session: {session}"
    }
  },

  // ✅ MUST be async
  onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {
    if (event.logMessageType !== "log:unsubscribe") return;

    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    if (!threadData?.settings?.sendLeaveMessage) return;

    const { leftParticipantFbId } = event.logMessageData;
    if (leftParticipantFbId == api.getCurrentUserID()) return;

    const hours = Number(getTime("HH"));
    const fullTime = getTime("DD/MM/YYYY HH:mm");

    const threadName = threadData.threadName || "Group";
    const userName = await usersData.getName(leftParticipantFbId);

    let { leaveMessage = getLang("defaultLeaveMessage") } = threadData.data || {};

    const type =
      event.author === leftParticipantFbId
        ? getLang("leaveType1")
        : getLang("leaveType2");

    leaveMessage = leaveMessage
      .replace(/\{userName\}|\{userNameTag\}/g, userName)
      .replace(/\{type\}/g, type)
      .replace(/\{threadName\}|\{boxName\}/g, threadName)
      .replace(/\{time\}/g, fullTime)
      .replace(
        /\{session\}/g,
        hours <= 10
          ? getLang("session1")
          : hours <= 12
          ? getLang("session2")
          : hours <= 18
          ? getLang("session3")
          : getLang("session4")
      );

    const form = { body: leaveMessage };

    if (leaveMessage.includes("{userNameTag}")) {
      form.mentions = [
        { id: leftParticipantFbId, tag: userName }
      ];
    }

    if (threadData.data?.leaveAttachment) {
      const files = threadData.data.leaveAttachment;
      const attachments = files.map(file =>
        drive.getFile(file, "stream")
      );
      form.attachment = (await Promise.allSettled(attachments))
        .filter(r => r.status === "fulfilled")
        .map(r => r.value);
    }

    message.send(form);
  }
};