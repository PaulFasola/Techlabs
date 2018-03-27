var SoatToken = artifacts.require("./SoatToken.sol");

module.exports = function(callback) {
    SoatToken.deployed()
        .then(  
                function(instance) { ; 
                    return instance.balanceOf(web3.eth.accounts[0]);
                }
              )
        .then(
                function(balance) { 
                    console.log(balance); 
                }
             );

             callback();
}