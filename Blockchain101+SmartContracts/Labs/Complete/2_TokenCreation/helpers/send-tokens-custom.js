'use strict';

const SoatToken = artifacts.require("./SoatToken.sol");
const program = require("commander");
const helper = require("./common-functions");

module.exports = function (callback) {
    let _instance = null;
    let errored = false;

    let amountToSend = (program.amount * 1000000000000000000);

    program
        .option('--amount [value]', 'Amount of tokens')
        .option('--sender [value]', 'Sender id')
        .option('--receiver [value]', 'Receiver id')
        .parse(process.argv);

    if (!program.amount || !program.sender || !program.receiver) {
        console.log("Cannot run the script, inssuficient args.");
        return;
    }

    let senderWallet = helper.getWalletByKey(program.sender);
    let receiverWallet = helper.getWalletByKey(program.receiver);

    SoatToken.deployed()
        .then(
            async function (instance) {
                _instance = instance;
                helper.bind(instance, web3);
                console.log("*******************************************************************************************************************")
                console.log(" Sending FROM: " + senderWallet + "    ->     TO: " + receiverWallet);
                console.log(" Amount: " + this.web3.fromWei(amountToSend, "ether"));
                console.log("*******************************************************************************************************************\n")
                return instance.transferFrom(senderWallet, receiverWallet, amountToSend);
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