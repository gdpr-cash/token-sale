var HDWalletProvider = require("truffle-hdwallet-provider");
const fs = require('fs');

let accounts = {};
if (fs.existsSync('accounts.json')) {
    accounts = JSON.parse(fs.readFileSync('accounts.json', 'utf8'));
} else {
    console.log('accounts.json was not found. You can only deploy to the testrpc.');
}

module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration> 
    networks: {
        development: {
            host: "127.0.0.1",
            port: 7545,
            gas: 4600000,
            network_id: "*" // Match any network id
        },
        rinkeby: {
            provider: new HDWalletProvider(accounts.mnemonic, "https://rinkeby.infura.io/" + accounts.infuraToken),
            network_id: 4,
            gas: 4500000,
            gasPrice: 25000000000
        },
        mainnet: {
            provider: new HDWalletProvider(accounts.mnemonic, 'https://mainnet.infura.io/' + accounts.infuraToken),
            network_id: 1,
            gas: 4500000,
            gasPrice: 4000000000,
        },
    }
};