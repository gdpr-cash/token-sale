const GDPRCrowdsale = artifacts.require('./GDPRCrowdsale.sol')

module.exports = deployer => {
  const startTime = 1518711240 // 15 Feb 2018 16:14:00 EET
  const endTime = 1527206400 // 25 May 2018 00:00:00 UTC
  const goal = 1000000000000000000000000 // approx. $200,000 in GDPR

  deployer.deploy(GDPRCrowdsale, startTime, endTime, goal)
}
