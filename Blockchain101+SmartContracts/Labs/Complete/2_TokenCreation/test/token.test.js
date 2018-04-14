const SoatToken = artifacts.require("./SoatToken.sol");

contract("SoatToken", async (accounts) => {

  it("should have put 13370000 SoatToken in the first account", async () => {
     let instance = await SoatToken.deployed();
     let balance = await instance.balanceOf.call(accounts[0]);
     var amount = SoatToken.web3.fromWei(balance, "ether");
     assert.equal(amount.toNumber(), 13370000);
  }) 

  it("should send coin correctly", async () => { 
    let account_one = accounts[0];
    let account_two = accounts[1];

    let amount = 10; 

    let instance = await SoatToken.deployed();
    let meta = instance;

    let balance = await meta.balanceOf.call(account_one);
    let account_one_starting_balance = balance.toNumber();

    balance = await meta.balanceOf.call(account_two);
    let account_two_starting_balance = balance.toNumber();
    await meta.transfer(account_two, amount, {from: account_one});

    balance = await meta.balanceOf.call(account_one);
    let account_one_ending_balance = balance.toNumber();

    balance = await meta.balanceOf.call(account_two);
    let account_two_ending_balance = balance.toNumber();

    assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
    assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
  });
});