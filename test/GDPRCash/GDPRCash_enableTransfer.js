// Unit tests for the constructor

var bigInt = require("big-integer");
var GDPRCash = artifacts.require("./GDPRCash.sol");
var GDPRCashSale = artifacts.require("./GDPRCashSale.sol");

contract('GDPRCash.enableTransfer', function (accounts) {
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
            await token.enableTransfer({ from: user2 });
        }
        catch (e) {
            console.log(e);
            return true;
        }
        throw new Error("non-owner was able to call enableTransfer");
    });

    it("should enable transfers and clear allowances", async function () {
        await token.setCrowdsale(sale.address, 0);
        await token.enableTransfer();
        let transferEnabled = await token.transferEnabled();
        assert.equal(transferEnabled, true);

        // Check that allowance state variables were updated correctly
        let crowdSaleAllowance = (await token.crowdSaleAllowance()).toNumber();
        let adminAllowance = (await token.adminAllowance()).toNumber();

        assert.equal(crowdSaleAllowance, 0);
        assert.equal(adminAllowance, 0);

        // Check that allowance mapping was updated correctly
        crowdSaleAllowance = (await token.allowance(owner, sale.address)).toNumber();
        assert.equal(crowdSaleAllowance, 0);

        let adminAddr = await token.adminAddr();
        adminAllowance = (await token.allowance(owner, adminAddr)).toNumber();
        assert.equal(adminAllowance, 0);
    });
});
