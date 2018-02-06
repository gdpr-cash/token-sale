
var GDPRCash = artifacts.require("./GDPRCash.sol");
var GDPRCashSale = artifacts.require("./GDPRCashSale.sol");
var bigInt = require("big-integer");


const timeTravel = function (time) {
    return new Promise((resolve, reject) => {
        web3.currentProvider.sendAsync({
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [time], // 86400 is num seconds in day
            id: new Date().getTime()
        }, (err, result) => {
            if (err) { return reject(err) }
            return resolve(result)
        });
    })
}

contract('GDPRCash (Basic Tests)', function (accounts) {
    // account[0] points to the owner on the testRPC setup
    var owner = accounts[0];
    var admin = accounts[1];
    var user2 = accounts[2];
    var user3 = accounts[3];

    beforeEach(function () {
        return GDPRCashSale.deployed().then(function (instance) {
            sale = instance;
            return GDPRCash.deployed();
        }).then(function (instance2) {
            token = instance2;
            return token.INITIAL_SUPPLY();
        });
    });

    it("should have 18 decimal places", async function () {
        var decimals = await token.decimals();
        assert.equal(decimals, 18);
    });

    it("transferEnabled is initialized to false", async function () {
        var result = await token.transferEnabled();
        assert.equal(result, false);
    });

    it("should have an initial owner balance of 200 million tokens", async function () {
        let ownerBalance = (await token.balanceOf(owner)).toNumber();

        // Note: 200 million * 1 miniGDPR => (200 * 10 ** 6) * (10 ** 18) = (2 ** 26)
        assert.equal(ownerBalance, bigInt("2e26"), "the owner balance should initially be 1 billion tokens");
    });

    it("should not allow a regular user to transfer before they are enabled", async function () {
        try {
            await token.transfer(admin, 1);
        }
        catch (e) {
            return true;
        }
        throw new Error("a regular user transferred before they were enabled")
    });

    it("should allow the admin and the crowdsale to make transfers", async function () {
        await token.transferFrom(owner, user2, 1, {from: admin});
        await token.transferFrom(owner, user3, 1, {from: sale.address});
        let ownerBalance = await token.balanceOf(owner);
        let initialSupply = await token.INITIAL_SUPPLY();
        let totalSupply = await token.totalSupply();
        let user2Balance = await token.balanceOf(user2);
        let user3Balance = await token.balanceOf(user3);
        ownerBalance = ownerBalance.toNumber();
        initialSupply = initialSupply.toNumber();
        totalSupply = totalSupply.toNumber();
        user2Balance = user2Balance.toNumber();
        user3Balance = user3Balance.toNumber();
        assert.equal(user2Balance, 1, "user2 should have 1 GDPRs");
        //assert.equal(user3Balance, 1, "user3 should have 1 GDPRs");
        //assert.equal(ownerBalance, totalSupply-2, "the owner should now have 30% of the original funds");
        assert.equal(totalSupply, initialSupply, "the total supply should equal the initial supply");
    });


    it("should not allow a regular user to enable transfers", async function () {
        let token = await GDPRCash.deployed();
        try {
            await token.enableTransfer({ from: user1 });
        }
        catch (e) {
            return true;
        }
        throw new Error("a regular user was able to call enableTransfer")
    });

    it("should enable transfers after invoking enableTransfer as owner", async function () {
        let isEnabledBefore = await token.transferEnabled();
        assert(!isEnabledBefore, "transfers should not be enabled");
        await token.enableTransfer();
        let isEnabledAfter = await token.transferEnabled();
        assert(isEnabledAfter, "transfers should be enabled");
    });

});

contract('GDPRCash (token burning tests)', function (accounts) {

    // account[0] points to the owner on the testRPC setup
    var owner = accounts[0];
    var admin = accounts[1];
    var user2 = accounts[2];
    var user3 = accounts[3];

    it("non-owner should not be able to burn tokens when transfers are not enabled", async function () {
        let token = await GDPRCash.deployed();
        let transferEnabled = await token.transferEnabled();
        assert(!transferEnabled);

        // Owner transfers 10 tokens to user1
        await token.transfer(user2, 10, {from: admin});
        let balance = await token.balanceOf(user2);
        assert.equal(balance, 10);

        // Recipient tries to burn 3 tokens when transfers are not enabled
        try {
            await token.burn(3, {from: user2});
        }
        catch (e) {
            return true;
        }
        throw new Error("a regular user was able to burn tokens when transfers were not enabled")
    });
});

/*
contract('GDPRCash (Transfer Ownership Tests)', function(accounts) {
  // account[0] points to the owner on the testRPC setup
  var owner = accounts[0];
  var user1 = accounts[1];
  var user2 = accounts[2];
  var user3 = accounts[3];

  it("should have all tokens in the owner's balance", async function() {
      let token = await GDPRCash.deployed();
      let ownerBalance = await token.balanceOf(owner);
      let initialSupply = await token.INITIAL_SUPPLY();
      initialSupply = initialSupply.toNumber();
      ownerBalance = ownerBalance.toNumber();
      assert.equal(ownerBalance, initialSupply, "the owner's balance should be the totalSupply");
  });



  it("should be able to transfer all tokens from owner to crowdsale and back", async function() {
      let token = await GDPRCash.deployed();
      let sale = await GDPRCashSale.deployed();
      let saleAddr = await sale.address;

      // owner transfers tokens to crowdsale address
      token.transferTokens(saleAddr);

      let initialSupply = (await token.INITIAL_SUPPLY()).toNumber();
      let saleBalance = (await token.balanceOf(saleAddr)).toNumber();
      let ownerBalance = (await token.balanceOf(owner)).toNumber();

      assert.equal(saleBalance, initialSupply, "the crowdsale should now have all tokens");
      assert.equal(ownerBalance, 0, "the original owner should now have zero tokens");

      // owner transfers tokens back to itself
      token.transferTokens(owner);

      saleBalance = (await token.balanceOf(saleAddr)).toNumber();
      ownerBalance = (await token.balanceOf(owner)).toNumber();

      assert.equal(ownerBalance, initialSupply, "the owner should have all the tokens");
      assert.equal(saleBalance, 0, "the crowdsale shouldn't have any tokens");
  });

  it("should not allow a regular user to transfer ownership", async function() {
      let token = await GDPRCash.deployed();
      try{
        await token.transferOwnership(user2, {from: user1});
      }
      catch (e){
        return true;
      }
      throw new Error("a regular user was able to call transferOwnership")
  });

  it("should allow the owner to transfer ownership to the crowdsale", async function() {
      let token = await GDPRCash.deployed();
      let sale = await GDPRCashSale.deployed();
      let tokenOwner = await token.owner();
      let saleAddr = await sale.address;
      assert.equal(owner, tokenOwner, "the token should be initially owned by the account[0] owner");
      await token.transferOwnership(saleAddr);
      let tokenOwnerAfter = await token.owner();
      assert.equal(saleAddr, tokenOwnerAfter, "the token should be owned by the crowdsale after transferOwnership");
  });
});


});
*/
