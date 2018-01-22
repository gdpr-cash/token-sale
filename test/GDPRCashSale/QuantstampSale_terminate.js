var GDPRCashSale = artifacts.require("./GDPRCashSale.sol");
var GDPRCash = artifacts.require("./GDPRCash.sol");

var bigInt = require("big-integer");


async function logUserBalances (token, accounts) {
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

async function logEthBalances (token, sale, accounts) {
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

contract('GDPRCashSale.terminate()', function(accounts) {
  // account[0] points to the owner on the testRPC setup
  var owner = accounts[0];
  var user1 = accounts[1];
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

  it("should terminate the crowdsale", async function() {
    var flag = false;

    // should be false to start
    let saleClosed = await sale.saleClosed();
    assert.equal(saleClosed, false);

    // should be true after call to terminate()
    await sale.terminate();
    saleClosed = await sale.saleClosed();
    assert.equal(saleClosed, true);

    // should remain true if you call it again
    await sale.terminate();
    saleClosed = await sale.saleClosed();
    assert.equal(saleClosed, true);

    // should not be able to send ether to sale
    try {
      web3.eth.sendTransaction({ from: user2, to: sale.address, value: web3.toWei(1) });
    }
    catch (e) {
      assert.equal(web3.eth.getBalance(sale.address), 0);
      flag = true;
    }

    if (!flag) {
      throw new Error("ether should not have been received because the crowdsale was terminated");
    }
  });

});
