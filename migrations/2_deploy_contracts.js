const GdprCash = artifacts.require('./GdprCash.sol')
const GdprCrowdsale = artifacts.require('./GdprCrowdsale.sol')

module.exports = (deployer, network, accounts) => {
    const startTime = 1519084800 // 15 Feb 2018 16:14:00 EET
    const endTime = 1521715920 // 25 May 2018 00:00:00 UTC

    var sale
    var token

    deployer
        .deploy(GdprCash)
        .then(() => {
            token = GdprCash.at(GdprCash.address);
            return deployer.deploy(GdprCrowdsale, startTime, endTime, token.address)
        })
        .then(() => {
            token.setCrowdsale(GdprCrowdsale.address);
        })
}
