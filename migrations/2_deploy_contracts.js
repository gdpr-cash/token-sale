const GdprCash = artifacts.require("./GdprCash.sol");
const GdprCrowdsale = artifacts.require("./GdprCrowdsale.sol");

module.exports = (deployer, network, accounts) => {
  const startTime = 1525132800; // 1st of May 2018 00:00:00 GMT
  const endTime = 1529884800; // 25th of June 2018 00:00:00 GMT

  var sale;
  var token;

  deployer
    .deploy(GdprCash)
    .then(() => {
      token = GdprCash.at(GdprCash.address);
      return deployer.deploy(GdprCrowdsale, startTime, endTime, token.address);
    })
    .then(() => {
      token.setCrowdsale(GdprCrowdsale.address);
    });
};
