const fs = require("fs");

const HDWallet = (walletPath = "./wallet.json") => {
  try {
    const data = JSON.parse(fs.readFileSync(walletPath));
    return data;
  } catch (err) {
    console.log("Error reading wallet.json", err.message); // no-console
    return [];
  }
};

module.exports = HDWallet;
