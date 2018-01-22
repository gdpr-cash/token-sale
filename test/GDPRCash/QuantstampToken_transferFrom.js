// Unit tests for the constructor

var bigInt = require("big-integer");
var GDPRCash = artifacts.require("./GDPRCash.sol");
var GDPRCashSale = artifacts.require("./GDPRCashSale.sol");

contract('GDPRCash.transferFrom', function(accounts) {
    // account[0] points to the owner on the testRPC setup
    var owner = accounts[0];
    var admin = accounts[1];
    var user2 = accounts[2];
    var user3 = accounts[3];

    beforeEach(
        function() {
            return GDPRCashSale.deployed().then(
        function(instance) {
            sale = instance;
            return GDPRCash.deployed();
        }).then(
        function(instance2){
            token = instance2;
            return token.INITIAL_SUPPLY();
        });
    });

    it("admin should be able to transfer tokens from allowance", async function() {
        await token.transferFrom(owner, user2, 1, {from: admin});

        let user2Balance = await token.balanceOf(user2);
        assert.equal(user2Balance, 1);
    });

    it("non-admin should not be able to transfer tokens from allowance", async function() {
        try {
           await token.transferFrom(accounts[0], user3, 1, {from: user2});
        }
        catch (e) {
            return true;
        }

        throw new Error("non-admin was able to transfer a token");
    });
});
