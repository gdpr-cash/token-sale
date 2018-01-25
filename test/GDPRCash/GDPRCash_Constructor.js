// Unit tests for the constructor

var bigInt = require("big-integer");
var GDPRCash = artifacts.require("./GDPRCash.sol");

contract('Constructor', function (accounts) {
    // account[0] points to the owner on the testRPC setup
    var owner = accounts[0];
    var user1 = accounts[1];

    var expectedCrowdSaleAllowance = bigInt("1.4e26"); // 140m
    var expectedAdminAllowance = bigInt("0.6e26"); // 60m

    beforeEach(
        function () {
            return GDPRCash.deployed().then(
                function (instance) {
                    token = instance;
                    return token.INITIAL_SUPPLY();
                })
        }
    );

    it("should not have transfers enabled", async function () {
        var transferEnabled = await token.transferEnabled();
        assert.equal(transferEnabled, false);
    });

    it("should have the correct name, symbol, decimals, and constants", async function () {
        var name = await token.name();
        assert.equal(name, "GDPR Cash");

        var symbol = await token.symbol();
        assert.equal(symbol, "GDPR");

        var decimals = (await token.decimals()).toNumber();
        assert.equal(decimals, 18);

        var initialSupply = (await token.INITIAL_SUPPLY()).toNumber();
        assert.equal(initialSupply, bigInt("2e26")); // 200m

        var crowdSaleAllowance = (await token.CROWDSALE_ALLOWANCE()).toNumber();
        assert.equal(crowdSaleAllowance, expectedCrowdSaleAllowance);

        var adminAllowance = (await token.ADMIN_ALLOWANCE()).toNumber();
        assert.equal(adminAllowance, expectedAdminAllowance);
    });

    it("should allocate the initial supply to the token owner", async function () {
        var balance = await token.balanceOf(accounts[0]);
        var initialSupply = (await token.INITIAL_SUPPLY()).toNumber();
        assert.equal(balance, initialSupply);
    });

    it("should be initialized with the correct admin address", async function () {
        var adminAddr = await token.adminAddr();
        assert.equal(adminAddr, accounts[1]);
    });

    it("should give admin the correct allowance", async function () {
        var adminAddr = await token.adminAddr();
        var adminAllowance = (await token.allowance(accounts[0], adminAddr)).toNumber();
        assert.equal(adminAllowance, expectedAdminAllowance);
    });

});