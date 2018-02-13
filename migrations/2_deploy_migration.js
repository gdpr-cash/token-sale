var SafeMath = artifacts.require("./math/SafeMath.sol");
var ERC20 = artifacts.require("./token/ERC20.sol");
var ERC20Basic = artifacts.require("./token/ERC20Basic.sol");
var BurnableToken = artifacts.require("./token/BurnableToken.sol");
var BasicToken = artifacts.require("./token/BasicToken.sol");
var StandardToken = artifacts.require("./token/StandardToken.sol");
var Ownable = artifacts.require("./ownership/Ownable.sol");
var Pausable = artifacts.require("./lifecycle/Pausable.sol");
var GDPRCash = artifacts.require("./GDPRCash.sol");
var GDPRCashSale = artifacts.require("./GDPRCashSale.sol");


module.exports = function(deployer, network, accounts) {
    console.log("Accounts: " + accounts);

    deployer.deploy(SafeMath);
    deployer.deploy(Ownable);
    deployer.link(Ownable, Pausable);
    deployer.deploy(Pausable);

    deployer.deploy(BasicToken);
    deployer.link(BasicToken, SafeMath);
    deployer.link(BasicToken, ERC20Basic);

    deployer.deploy(StandardToken);
    deployer.link(StandardToken, BasicToken);

    deployer.deploy(GDPRCash);
    deployer.link(GDPRCash, StandardToken);
    deployer.link(GDPRCash, Ownable);
    deployer.link(GDPRCash, BurnableToken);
    deployer.link(GDPRCash, SafeMath);

    var time = Math.floor(new Date().getTime() / 1000);
    //var time = web3.eth.getBlock(web3.eth.blockNumber).timestamp + 120;
    console.log("TIME = ", time);

    deployer.deploy(GDPRCash, accounts[1]).then(function() {
        const fundingGoal = 10;
        const fundingCap = 20;
        const minContrib = 1;
        const start = time;
        const duration = 1000;
        const rate = 5000; // GDPR for 1 ether
        return deployer.deploy(
            GDPRCashSale, 
            accounts[1], 
            fundingGoal, 
            fundingCap, 
            minContrib, 
            start, 
            duration, 
            rate, 
            GDPRCash.address);
    });

};