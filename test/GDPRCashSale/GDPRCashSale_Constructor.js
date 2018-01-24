var GDPRCashSale = artifacts.require("./GDPRCashSale.sol");
var GDPRCash = artifacts.require("./GDPRCash.sol");

var bigInt = require("big-integer");


async function logUserBalances(token, accounts) {
    console.log("")
    console.log("User Balances:")
    console.log("--------------")
    console.log(`Owner: ${(await token.balanceOf(accounts[0])).toNumber()}`)
    console.log(`User1: ${(await token.balanceOf(accounts[1])).toNumber()}`)
    console.log(`User2: ${(await token.balanceOf(accounts[2])).toNumber()}`)
    console.log(`User3: ${(await token.balanceOf(accounts[3])).toNumber()}`)

    console.log("--------------")
    console.log("")
}

async function logEthBalances(token, sale, accounts) {
    console.log("")
    console.log("Eth Balances:")
    console.log("-------------")
    console.log(`Owner: ${(await web3.eth.getBalance(accounts[0])).toNumber()}`)
    console.log(`User1: ${(await web3.eth.getBalance(accounts[1])).toNumber()}`)
    console.log(`User2: ${(await web3.eth.getBalance(accounts[2])).toNumber()}`)
    console.log(`User3: ${(await web3.eth.getBalance(accounts[3])).toNumber()}`)
    console.log(`Sale : ${(await web3.eth.getBalance(sale.address)).toNumber()}`)
    console.log(`Token: ${(await web3.eth.getBalance(token.address)).toNumber()}`)


    console.log("--------------")
    console.log("")
}

contract('GDPRCashSale Constructor', function (accounts) {
    // account[0] points to the owner on the testRPC setup
    var owner = accounts[0];
    var user1 = accounts[1];
    var user2 = accounts[2];
    var user3 = accounts[3];

    beforeEach(
        function () {
            return GDPRCashSale.deployed().then(
                function (instance) {
                    sale = instance;
                    return GDPRCash.deployed();
                }).then(
                function (instance2) {
                    token = instance2;
                    return token.INITIAL_SUPPLY();
                });
        });

    it("should have the correct parameters, and calculate the end time correctly", async function () {
        let beneficiary = accounts[1];

        let tokenReward = await sale.tokenReward();
        assert.equal(token.address, tokenReward);

        let amountRaised = (await sale.amountRaised()).toNumber();
        let refundAmount = (await sale.refundAmount()).toNumber();

        assert.equal(amountRaised, 0);
        assert.equal(refundAmount, 0);

        let ifSuccessfulSendTo = await sale.beneficiary();
        let fundingGoalInEthers = (await sale.fundingGoal()).toNumber();
        let fundingCapInEthers = (await sale.fundingCap()).toNumber();
        let minimumContributionInWei = (await sale.minContribution()).toNumber();
        let start = (await sale.startTime()).toNumber();
        let end = (await sale.endTime()).toNumber();
        let rateQspToEther = (await sale.rate()).toNumber();

        assert.equal(ifSuccessfulSendTo, beneficiary, "beneficiary address is incorrect");
        assert.equal(fundingGoalInEthers, 10 * (10 ** 18), "funding goal is incorrect");
        assert.equal(fundingCapInEthers, 20 * (10 ** 18), "funding cap is incorrect");
        assert.equal(minimumContributionInWei, 1, "minimum contribution in wei is incorrect");
        assert.equal(start + 1000*60, end, "end time should be 1000 minutes after start time");
        assert.equal(rateQspToEther, 5000, "conversion rate from GDPR to ETH is incorrect");
    });
});
