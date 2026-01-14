const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "accept",
    aliases: ["acp"],
    version: "1.1",
    author: "SHOUROV",
    countDown: 8,
    role: 2,
    shortDescription: "Accept or delete friend requests",
    longDescription: "Accept or delete Facebook friend requests",
    category: "Utility"
  },

  // ================= ON START =================
  onStart: async function ({ event, api, commandName }) {
    try {
      const form = {
        av: api.getCurrentUserID(),
        fb_api_req_friendly_name:
          "FriendingCometFriendRequestsRootQueryRelayPreloader",
        fb_api_caller_class: "RelayModern",
        doc_id: "4499164963466303",
        variables: JSON.stringify({ input: { scale: 3 } })
      };

      const res = await api.httpPost(
        "https://www.facebook.com/api/graphql/",
        form
      );

      if (!res || typeof res !== "string") {
        return api.sendMessage(
          "❌ Facebook did not return any data.",
          event.threadID,
          event.messageID
        );
      }

      let data;
      try {
        data = JSON.parse(res);
      } catch (e) {
        console.log("RAW FB RESPONSE:\n", res);
        return api.sendMessage(
          "❌ Failed to parse Facebook response.",
          event.threadID,
          event.messageID
        );
      }

      const listRequest =
        data?.data?.viewer?.friending_possibilities?.edges;

      if (!Array.isArray(listRequest) || listRequest.length === 0) {
        return api.sendMessage(
          "✅ No pending friend requests found.",
          event.threadID,
          event.messageID
        );
      }

      let msg = "📩 Pending Friend Requests:\n";
      let i = 0;

      for (const user of listRequest) {
        i++;
        msg +=
          `\n${i}. Name: ${user.node.name}` +
          `\nID: ${user.node.id}` +
          `\nUrl: ${user.node.url.replace("www.facebook", "fb")}` +
          `\nTime: ${moment(user.time * 1000)
            .tz("Asia/Dhaka")
            .format("DD/MM/YYYY HH:mm:ss")}\n`;
      }

      api.sendMessage(
        `${msg}\nReply with:\n➤ add <number | all>\n➤ del <number | all>`,
        event.threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            listRequest,
            author: event.senderID,
            unsendTimeout: setTimeout(() => {
              api.unsendMessage(info.messageID);
            }, this.config.countDown * 1000)
          });
        },
        event.messageID
      );
    } catch (err) {
      console.error("ACCEPT CMD ERROR:", err);
      api.sendMessage(
        "❌ An unexpected error occurred.",
        event.threadID,
        event.messageID
      );
    }
  },

  // ================= ON REPLY =================
  onReply: async function ({ event, api, Reply }) {
    try {
      const { author, listRequest, messageID, unsendTimeout } = Reply;
      if (event.senderID !== author) return;

      clearTimeout(unsendTimeout);

      const args = event.body
        .trim()
        .replace(/ +/g, " ")
        .toLowerCase()
        .split(" ");

      if (!["add", "del"].includes(args[0])) {
        return api.sendMessage(
          "❌ Use: add <number|all> or del <number|all>",
          event.threadID,
          event.messageID
        );
      }

      const form = {
        av: api.getCurrentUserID(),
        fb_api_caller_class: "RelayModern",
        variables: {
          input: {
            source: "friends_tab",
            actor_id: api.getCurrentUserID(),
            client_mutation_id: Math.floor(Math.random() * 1000).toString()
          },
          scale: 3,
          refresh_num: 0
        }
      };

      if (args[0] === "add") {
        form.fb_api_req_friendly_name =
          "FriendingCometFriendRequestConfirmMutation";
        form.doc_id = "3147613905362928";
      } else {
        form.fb_api_req_friendly_name =
          "FriendingCometFriendRequestDeleteMutation";
        form.doc_id = "4108254489275063";
      }

      let targets = args[1] === "all"
        ? listRequest.map((_, i) => i + 1)
        : args.slice(1).map(Number);

      const success = [];
      const failed = [];

      for (const index of targets) {
        const user = listRequest[index - 1];
        if (!user) {
          failed.push(`Invalid index: ${index}`);
          continue;
        }

        try {
          form.variables.input.friend_requester_id = user.node.id;
          const payload = {
            ...form,
            variables: JSON.stringify(form.variables)
          };

          const res = await api.httpPost(
            "https://www.facebook.com/api/graphql/",
            payload
          );

          const parsed = JSON.parse(res);
          if (parsed.errors) {
            failed.push(user.node.name);
          } else {
            success.push(user.node.name);
          }
        } catch (e) {
          failed.push(user.node.name);
        }
      }

      api.sendMessage(
        `✅ ${args[0] === "add" ? "Accepted" : "Deleted"}: ${
          success.length
        }\n${success.join("\n")}${
          failed.length
            ? `\n\n❌ Failed: ${failed.length}\n${failed.join("\n")}`
            : ""
        }`,
        event.threadID,
        event.messageID
      );

      api.unsendMessage(messageID);
    } catch (err) {
      console.error("ACCEPT REPLY ERROR:", err);
    }
  }
};
