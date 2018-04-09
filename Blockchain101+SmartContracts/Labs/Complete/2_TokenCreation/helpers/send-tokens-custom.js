var SoatToken = artifacts.require("./SoatToken.sol");

module.exports = function (callback) {
    var _instance = null;
    var errored = false;

    SoatToken.deployed()
        .then(
            async function (instance) {
                _instance = instance;
                console.log("*****************************************************************************************************************")
                console.log(" Sending FROM: " + web3.eth.accounts[0] + "    ->     TO: " + web3.eth.accounts[1])
                console.log("*****************************************************************************************************************\n")
                return instance.transfer(web3.eth.accounts[1], 1000000000000000000);
            },
            async function (error) {
                errored = true;
                console.log("Error : " + error);
            }
        )
        .then(
            async (result) => {
                if(result.tx !== undefined){ 
                    console.log(" == Transaction Succeeded !");
                    console.log(` == Tx is : ${ result.tx } \n\n`);
                } else{
                    console.log("Transaction may have failed ...\n\n");
                }
                
                console.log("Transaction details : \n**************************************************************************************************\n")
                console.log(result);
            },
            function (error) {
                errored = true;
                console.log("Error : " + error);
            });

    callback();
}