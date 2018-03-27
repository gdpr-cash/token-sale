const GdprCash = artifacts.require('./GdprCash.sol')
const GdprCrowdsale = artifacts.require('./GdprCrowdsale.sol')

module.exports = async (deployer, network, accounts) => {
    const startTime = 1522153361 // 15 Feb 2018 16:14:00 EET
    const endTime = 1553689353 // 25 May 2018 00:00:00 UTC

    await deployer.deploy(GdprCash);
    const token = GdprCash.at(GdprCash.address);
    await deployer.deploy(GdprCrowdsale, startTime, endTime, token.address)
    await token.setCrowdsale(GdprCrowdsale.address);
    const sale = await token.crowdsale.call();
}
