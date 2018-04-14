'use strict';

var program = require("commander");
var SoatToken = artifacts.require("./SoatToken.sol");

module.exports = function (callback) {
    var _instance = null;
    var errored = false;

    program
        .option('--amount [value]', 'Amount of tokens')
        .option('--sender [value]', 'Sender adress')
        .option('--receiver [value]', 'Receiver adress')
        .parse(process.argv);

    if (!program.amount || !program.sender || !program.receiver) {
        console.log("Cannot run the script, inssuficient args.");
        return;
    }

    var amountToSend = (program.amount * 1000000000000000000);

    SoatToken.deployed()
        .then(
            async function (instance) {
                _instance = instance;
                console.log("*******************************************************************************************************************")
                console.log(" Sending FROM: " + program.sender + "    ->     TO: " + program.receiver);
                console.log(" Amount: " + this.web3.fromWei(amountToSend, "ether"));
                console.log("*******************************************************************************************************************\n")
                return instance.transfer(program.receiver, amountToSend);
            },
            async function (error) {
                errored = true;
                console.log("Error : " + error);
            }
        )
        .then(
            async (result) => {
                if (result.tx !== undefined) {
                    console.log(" == Transaction Succeeded !");
                    console.log(` == Tx is : ${ result.tx } \n\n`);
                } else {
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