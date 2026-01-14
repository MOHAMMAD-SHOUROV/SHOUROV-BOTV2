const axios = require('axios');

// Function to fetch base API URL from GitHub JSON
async function getBaseUrl() {
  try {
    const res = await axios.get('https://raw.githubusercontent.com/Ayan-alt-deep/xyc/main/baseApiurl.json');
    return res.data.apiUrl || 'https://eren-td.onrender.com'; // fallback
  } catch (err) {
    console.error("Error fetching base URL:", err);
    return 'https://eren-td.onrender.com'; // fallback
  }
}

async function getTruth() {
  const baseUrl = await getBaseUrl();
  try {
    const response = await axios.get(`${baseUrl}/truth`);
    return response.data;
  } catch (error) {
    console.error("Error fetching truth:", error);
    return { error: "Failed to fetch truth. Please try again later." };
  }
}

async function getDare() {
  const baseUrl = await getBaseUrl();
  try {
    const response = await axios.get(`${baseUrl}/dare`);
    return response.data;
  } catch (error) {
    console.error("Error fetching dare:", error);
    return { error: "Failed to fetch dare. Please try again later." };
  }
}

module.exports = {
  config: {
    name: "truthdare",
    aliases: ["td"],
    version: "1.1",
    author: "✨ Eren Yeh ✨",
    shortDescription: "Random Truth or Dare",
    longDescription: "Fetch a random truth or dare question from a dynamic API.",
    category: "fun",
    guide: {
      en: "{pn} truth\n{pn} dare"
    }
  },

  onStart: async function ({ message, args }) {
    const type = args[0]?.toLowerCase();

    if (type === "truth") {
      const truth = await getTruth();
      return truth.error
        ? message.reply(truth.error)
        : message.reply(`✨ Truth Time!\n\n💭 Question: ${truth.result}`);
    } 
    
    else if (type === "dare") {
      const dare = await getDare();
      return dare.error
        ? message.reply(dare.error)
        : message.reply(`⚡ Dare Time!\n\n🎯 Do this: ${dare.result}`);
    } 
    
    else {
      return message.reply("Please type `truth` or `dare`.\nExample: `.td truth` or `.td dare`");
    }
  }
};
