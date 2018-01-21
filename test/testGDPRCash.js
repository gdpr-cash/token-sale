// Specifically request an abstraction for GDPRCash
var GDPRCash = artifacts.require("GDPRCash");

contract('GDPRCash', function(accounts) {
  it("should put 200000000 GDPR in the first account", function() {
    return GDPRCash.deployed().then(function(instance) {
      return instance.balanceOf.call(accounts[0]);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 200000000, "200000000 wasn't in the first account");
    });
  });
  /*it("should send coin correctly", function() {
    var meta;

    // Get initial balances of first and second account.
    var account_one = accounts[8];
    var account_two = accounts[9];

    var account_one_starting_balance;
    var account_two_starting_balance;
    var account_one_ending_balance;
    var account_two_ending_balance;

    var amount = 100;

    return GDPRCash.deployed().then(function(instance) {
      cash = instance;
      return cash.balanceOf.call(account_one);
    }).then(function(balance) {
      account_one_starting_balance = balance.toNumber();
      return cash.balanceOf.call(account_two);
    }).then(function(balance) {
      account_two_starting_balance = balance.toNumber();
      return cash.sendCoin(account_two, amount, {from: account_one});
    }).then(function() {
      return cash.getBalance.call(account_one);
    }).then(function(balance) {
      account_one_ending_balance = balance.toNumber();
      return cash.getBalance.call(account_two);
    }).then(function(balance) {
      account_two_ending_balance = balance.toNumber();

      assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
      assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
    });
  });*/
});