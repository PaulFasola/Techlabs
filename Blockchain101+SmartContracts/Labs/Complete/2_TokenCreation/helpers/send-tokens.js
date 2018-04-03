var CommonFunctions = require("./common-functions");
var SoatToken = require("./SoatToken.sol");

module.exports = function (callback) {
    var _instance = null;
    var errored = false;
    console.clear();

    SoatToken.deployed()
        .then(
            async function (instance) {
                _instance = instance;
                console.log("Sending FROM: " + web3.eth.accounts[0] + " TO: " + web3.eth.accounts[1])
                return instance.transfer(web3.eth.accounts[1], 1);
            },
            async function (error) {
                errored = true;
                console.log("Error : " + error);
            }
        )
        .then(
            async (result) => {
                console.log(result);
                var balances = await CommonFunctions.getBalances(_instance, web3);
                console.log(balances);
                balances.forEach(function (data) {
                    console.log(data.account + " owe " + data.balance);
                });
            },
            function (error) {
                errored = true;
                console.log("Error : " + error);
            });

    callback();
}