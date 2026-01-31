const createFuncMessage = global.utils.message;
const handlerCheckDB = require("./handlerCheckData.js");

module.exports = (
  api,
  threadModel,
  userModel,
  dashBoardModel,
  globalModel,
  usersData,
  threadsData,
  dashBoardData,
  globalData
) => {
  const handlerEvents = require(
    process.env.NODE_ENV == "development"
      ? "./handlerEvents.dev.js"
      : "./handlerEvents.js"
  )(
    api,
    threadModel,
    userModel,
    dashBoardModel,
    globalModel,
    usersData,
    threadsData,
    dashBoardData,
    globalData
  );

  return async function (event) {

    // 🔧 ===============================
    // 🔧 FIX: mention / reply issue
    // 🔧 ===============================
    if (!event.mentions) event.mentions = {};
    if (!event.messageReply) event.messageReply = null;

    // 🚫 Anti inbox check
    if (
      global.GoatBot.config.antiInbox === true &&
      (
        event.senderID == event.threadID ||
        event.userID == event.senderID ||
        event.isGroup === false
      )
    ) {
      return;
    }

    // 📩 Create message helper
    const message = createFuncMessage(api, event);

    // 🗄️ Check & create DB data
    await handlerCheckDB(usersData, threadsData, event);

    // 🔁 Load handler events
    const handlerChat = await handlerEvents(event, message);
    if (!handlerChat) return;

    const {
      onAnyEvent,
      onFirstChat,
      onStart,
      onChat,
      onReply,
      onEvent,
      handlerEvent,
      onReaction,
      typ,
      presence,
      read_receipt
    } = handlerChat;

    // 🌐 Global events
    onAnyEvent();

    // 🔀 Event switch
    switch (event.type) {

      case "message":
      case "message_reply":
      case "message_unsend":
        onFirstChat();
        onChat();
        onStart();
        onReply();
        break;

      case "event":
        handlerEvent();
        onEvent();
        break;

      case "message_reaction":
        onReaction();
        break;

      case "typ":
        typ();
        break;

      case "presence":
        presence();
        break;

      case "read_receipt":
        read_receipt();
        break;

      default:
        break;
    }
  };
};