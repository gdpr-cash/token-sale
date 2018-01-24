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

contract('GDPRCashSale setRate', function (accounts) {
    // account[0] points to the owner on the testRPC setup
    var owner = accounts[0];
    var user1 = accounts[1];
    var user2 = accounts[2];
    var user3 = accounts[3];

    it("should only be allowed to set values inside the bounds", async function () {
        var sale = await GDPRCashSale.deployed();
        var LOW = (await sale.LOW_RANGE_RATE()).toNumber();
        var HIGH = (await sale.HIGH_RANGE_RATE()).toNumber();

        await sale.setRate(LOW);
        var low_rate = await sale.rate();
        await sale.setRate(HIGH);
        var high_rate = await sale.rate();
        await sale.setRate(LOW + 1);
        var mid_rate = await sale.rate();

        assert.equal(low_rate, LOW, "the rate should be set to the lower bound");
        assert.equal(high_rate, HIGH, "the rate should be set to the upper bound");
        assert.equal(mid_rate, LOW + 1, "the rate should be set to some middle rate");

        try {
            await sale.setRate(LOW - 1);
            throw new Error("should not be allowed to set rate below LOW");
        }
        catch (e) { }

        try {
            await sale.setRate(HIGH + 1);
            throw new Error("should not be allowed to set rate above HIGH");
        }
        catch (e) { }
    });
});