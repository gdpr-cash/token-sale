var GDPRCashSale = artifacts.require("./GDPRCashSale.sol");
var GDPRCash = artifacts.require("./GDPRCash.sol");

contract('GDPRCashSale constructor', function(accounts) {
  // account[0] points to the owner on the testRPC setup
  var owner = accounts[0];
  var admin = accounts[1];
  var user2 = accounts[2];
  var user3 = accounts[3];

  beforeEach(function() {
    return GDPRCashSale.deployed().then(function(instance) {
        sale = instance;
        return GDPRCash.deployed();
    }).then(function(instance2){
      token = instance2;
      return token.INITIAL_SUPPLY();
    });
  });

  it("should be able to set the crowdsale", async function() {
      let crowdSaleAllowance = (await token.crowdSaleAllowance()).toNumber();
      await token.setCrowdsale(sale.address, crowdSaleAllowance);
      let allowance = (await token.allowance(owner, sale.address)).toNumber();
      assert.equal(allowance, crowdSaleAllowance);
  });

  it("should be able user to buy GDPR Cash", async function() {
    let crowdSaleAllowance = (await token.crowdSaleAllowance()).toNumber();
    let rate = (await sale.rate()).toNumber();
    console.log(rate, crowdSaleAllowance);
    await token.setCrowdsale(sale.address, crowdSaleAllowance); 
    await web3.eth.sendTransaction({from: user2, to: sale.address, value: web3.toWei(1), gas: 200000})
  });
});
