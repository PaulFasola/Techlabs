const SoatToken = artifacts.require("./SoatToken.sol");
const helper = require("./common-functions");

module.exports = (callback) => {
    SoatToken.deployed()
        .then( async (contractInstance) => {
            helper.bind(contractInstance, web3);

            var balances = await helper.getBalances(); 
            console.log(SoatToken.contractName + " balance summary");
            console.log("               Account                      |  Balance                 ");
            balances.forEach((balance) => console.log(`${balance.account}     ${web3.fromWei(balance.balance) }`))
        })  
        .catch((msg) => console.log("Error : " + msg));

    callback();
}