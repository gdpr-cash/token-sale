const GDPRAirdrop = artifacts.require('./GDPRAirdrop.sol')

module.exports = deployer => {
  const crowdsaleAddress = ''
  const tokenAddress = ''

  deployer.deploy(GDPRAirdrop, crowdsaleAddress, tokenAddress)
}
