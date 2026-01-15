module.exports = {
  config: {
    name: "pending",
    version: "1.2",
    prefix: false,
    author: "ARYAN | Fixed by Mahabub",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Show and manage pending group requests"
    },
    longDescription: {
      en: "View all pending groups and approve or cancel them easily."
    },
    category: "Goat-alAuthor"
  },

  langs: {
    en: {
      invalidNumber: "%1 is not a valid number",
      cancelSuccess: "❌ Refused %1 thread(s)!",
      approveSuccess: "✅ Approved successfully %1 thread(s)!",
      cantGetPendingList: "⚠️ Can't get the pending list!",
      returnListPending: "»「PENDING」« ❮ Total threads to approve: %1 ❯\n\n%2",
      returnListClean: "「PENDING」There is no thread in the pending list"
    }
  },

  onReply: async function ({ api, event, Reply, getLang, commandName, prefix }) {
    if (String(event.senderID) !== String(Reply.author)) return;
    const { body, threadID, messageID } = event;
    let count = 0;

    // ❌ Cancel (refuse) pending threads
    if (isNaN(body) && (body.indexOf("c") == 0 || body.indexOf("cancel") == 0)) {
      const index = body.slice(1).trim().split(/\s+/);
      for (const singleIndex of index) {
        if (isNaN(singleIndex) || singleIndex <= 0 || singleIndex > Reply.pending.length)
          return api.sendMessage(getLang("invalidNumber", singleIndex), threadID, messageID);

        const target = Reply.pending[singleIndex - 1];
        try {
          await api.removeUserFromGroup(api.getCurrentUserID(), target.threadID);
          count++;
        } catch (e) {
          console.error("Cancel failed:", e);
        }
      }
      return api.sendMessage(getLang("cancelSuccess", count), threadID, messageID);
    }

    // ✅ Approve pending threads
    else {
      const index = body.trim().split(/\s+/);
      for (const singleIndex of index) {
        if (isNaN(singleIndex) || singleIndex <= 0 || singleIndex > Reply.pending.length)
          return api.sendMessage(getLang("invalidNumber", singleIndex), threadID, messageID);

        const target = Reply.pending[singleIndex - 1];

        try {
          // ✅ Universal approve (works in all fb-chat-api versions)
          if (typeof api.handleMessageRequest === "function") {
            await api.handleMessageRequest(target.threadID, true);
          } 
          // 🧩 fallback for older fb-chat-api
          else if (typeof api.httpPost === "function") {
            await new Promise((resolve, reject) => {
              api.httpPost(
                "https://graph.facebook.com/v1.0/me/threads",
                { folder: "inbox", thread_fbid: target.threadID },
                (err) => (err ? reject(err) : resolve())
              );
            });
          }

          // ✅ Send message to approved thread
          await api.sendMessage(
            `✅ 𝗧𝗵𝗶𝘀 𝗯𝗼𝘅 𝗵𝗮𝘀 𝗯𝗲𝗲𝗻 𝗮𝗽𝗽𝗿𝗼𝘃𝗲𝗱 𝘀𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆!\n\n👤 Approved by: MR᭄﹅ MAHABUB﹅ メꪜ\n🔗 https://www.facebook.com/www.xnxx.com140\n\nType ${prefix}help to see all commands.`,
            target.threadID
          );
          count++;
        } catch (e) {
          console.error("Approve failed:", e);
        }
      }

      return api.sendMessage(getLang("approveSuccess", count), threadID, messageID);
    }
  },

  onStart: async function ({ api, event, getLang, commandName }) {
    const { threadID, messageID } = event;
    let msg = "", index = 1;

    try {
      var spam = await api.getThreadList(100, null, ["OTHER"]) || [];
      var pending = await api.getThreadList(100, null, ["PENDING"]) || [];
    } catch (e) {
      console.error(e);
      return api.sendMessage(getLang("cantGetPendingList"), threadID, messageID);
    }

    const list = [...spam, ...pending].filter(group => group.isSubscribed && group.isGroup);

    for (const single of list)
      msg += `${index++}/ ${single.name} (${single.threadID})\n`;

    if (list.length != 0) {
      return api.sendMessage(
        getLang("returnListPending", list.length, msg),
        threadID,
        (err, info) => {
          if (err) return;
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            author: event.senderID,
            pending: list
          });
        },
        messageID
      );
    } else {
      return api.sendMessage(getLang("returnListClean"), threadID, messageID);
    }
  }
};