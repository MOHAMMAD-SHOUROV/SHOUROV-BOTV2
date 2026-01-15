module.exports = {
	config: {
		name: "goiadmin",
		author: "Chitron Bhattacharjee",
		role: 0,
		shortDescription: " ",
		longDescription: "",
		category: "BOT",
		guide: "{pn}"
	},

onChat: function({ api, event }) {
	if (event.senderID !== "61576954220811") {
		var aid = ["61576954220811","61578517133556"];
		for (const id of aid) {
		if ( Object.keys(event.mentions) == id) {
			var msg = ["কিরে তোর প্রোবলেম কি😒আমার বস কে মেনসন দিস কেন 🫰🏻🧛‍♀️মেনসন না দিয়ে আমার বসের নাম্বারে কিছু Md দে এই নে নাম্বার :- 01621251318  ৫০ Gb Mb দিবি🫰🏻😊। 🦆 "];
			return api.sendMessage({body: msg[Math.floor(Math.random()*msg.length)]}, event.threadID, event.messageID);
		}
		}}
},
onStart: async function({}) {
	}
};
