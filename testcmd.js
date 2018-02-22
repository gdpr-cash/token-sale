const GdprCash = artifacts.require('./GdprCash.sol')
const GdprCrowdsale = artifacts.require('./GdprCrowdsale.sol')

module.exports = function(callback) {
    let sale
    let token
    GdprCash.deployed().then(inst => token = inst)
    GdprCrowdsale.deployed().then(inst2 => sale = inst2)
    owner = web3.eth.accounts[0]
    user2 = web3.eth.accounts[2]
    user3 = web3.eth.accounts[3]

    web3.eth.sendTransaction({from: user3, to: sale.address, value: web3.toWei(1, 'ether'), gas: 200000})
    callback();
}