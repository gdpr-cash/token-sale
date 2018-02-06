// Unit tests for the constructor

var bigInt = require("big-integer");
var GDPRCash = artifacts.require("./GDPRCash.sol");
var GDPRCashSale = artifacts.require("./GDPRCashSale.sol");

contract('GDPRCash.setCrowdsale', function (accounts) {
    // account[0] points to the owner on the testRPC setup
    var owner = accounts[0];
    var user1 = accounts[1];

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

    it("should not be callable by non-owner", async function () {
        try {
            await token.setCrowdsale(sale.address, 0, { from: user1 });
        }
        catch (e) {
            return true;
        }
        throw new Error("non-owner was able to call setCrowdsale");
    });

    it("should set the address of the crowdsale", async function () {
        await token.setCrowdsale(sale.address, 0);
        let crowdSaleAddr = await token.crowdSaleAddr();
        assert.equal(crowdSaleAddr, sale.address);
    });

    it("should not permit an allowance larger than what the token owner is supposed to allow", async function () {
        let crowdSaleAllowance = bigInt((await token.crowdSaleAllowance()));
        try {
            await token.setCrowdsale(sale.address, crowdSaleAllowance + 1);
        }
        catch (e) {
            return true;
        }

        throw new Error("a crowdsale was given a bigger allowance than the token should allow");
    });

    // Note: I couldn't get it to perform comparisons of bigInt numbers, so used a small int
    it("should provide the correct allowance of GDPR for the crowdsale", async function () {
        let expectedCrowdSaleAllowance = 1;
        await token.setCrowdsale(sale.address, expectedCrowdSaleAllowance);

        let crowdSaleAllowance = await token.allowance(accounts[0], sale.address);

        assert.equal(crowdSaleAllowance, expectedCrowdSaleAllowance);
    });

    it("should clear allowance of old crowdsale and correctly set that of new crowdsale", async function () {
        let expectedCrowdSaleAllowance = 1;

        await token.setCrowdsale(sale.address, expectedCrowdSaleAllowance);
        let crowdSaleAllowance = await token.allowance(accounts[0], sale.address);
        assert.equal(crowdSaleAllowance, expectedCrowdSaleAllowance);

        // change to a different crowdsale address (user1 isn't actually a crowdsale, but it doesn't matter)
        await token.setCrowdsale(user1, expectedCrowdSaleAllowance);

        let oldCrowdSaleAllowance = await token.allowance(accounts[0], sale.address);
        assert.equal(oldCrowdSaleAllowance, 0);

        let newCrowdSaleAllowance = await token.allowance(accounts[0], user1);
        assert.equal(newCrowdSaleAllowance, expectedCrowdSaleAllowance);
    });

    // this test should be at the end of these tests because
    // it calls the enableTransfer() function, which makes it
    // impossible to set new crowdsales (if it works, that is)
    it("should not be able to call setCrowdsale when transfers are enabled", async function () {
        await token.enableTransfer();
        let transferEnabled = await token.transferEnabled();
        assert.equal(transferEnabled, true);

        try {
            await token.setCrowdsale(sale.address)
        }
        catch (e) {
            return true;
        }

        throw new Error("a crowdsale was set after transferEnabled was set to true");
    });

});
