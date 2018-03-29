var SoatToken = artifacts.require("./SoatToken.sol");

module.exports = function(callback) {
    SoatToken.deployed()
        .then(  
                function(instance) { ; 
                    web3.eth.accounts.forEach(function (account) {
                        _instance.balanceOf(account, web3).then(function (balance) {
                            balance = web3.fromWei(balance.toNumber(), "ether"); // since we have 18 digits
                            console.log(account.toString() + " owe " + balance + " STK");
                        });
                    });
                }
              );
             callback();
}