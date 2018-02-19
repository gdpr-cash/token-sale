const GDPRCrowdsale = artifacts.require('./GDPRCrowdsale.sol')

module.exports = deployer => {
  const startTime = 1518998400 // 15 Feb 2018 16:14:00 EET
  const endTime = 1519171200 // 25 May 2018 00:00:00 UTC
  //const goal = 1000000000000000000000000 // approx. $200,000 in GDPR
  const goal = 10000000000000000000000 // 2 ether

  var sale
  var token
  var vault

  deployer
    .deploy(GDPRCrowdsale, startTime, endTime, goal)
    .then(() => GDPRCrowdsale.deployed())
    .then(inst => {
      sale = inst
      return sale.token()
    })
    .then(inst2 => {
      token = inst2
      return sale.vault()
    })
    .then(inst3 => {
      vault = inst3
      console.log('-------------------------------------------------')
      console.log('[GDPRCash]      = ', token)
      console.log('[GDPRCrowdsale] = ', sale.address)
      console.log('[Vault]         = ', vault)
      console.log('-------------------------------------------------')
    })
}
