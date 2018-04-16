'use strict';

var contractHelper = {
    instance: {},
    web3: {},

    bind: (contractInstance, web3Hook) => {
        contractHelper.instance = contractInstance;
        contractHelper.web3 = web3Hook;
    },

    getBalances: async () => {
        var balances = [];

        if (contractHelper.web3.eth === undefined) {
            return balances;
        }

        await Promise.all(
            contractHelper.web3.eth.accounts.map(
                (account, i) => {
                    return contractHelper.instance.balanceOf(account).then((balance) => {
                        balances.push({
                            account: account,
                            balance: balance
                        });
                    })

                })
        );

        return balances;
    },

    getWalletByKey: (key) => {
        return contractHelper.web3.eth.accounts[key];
    },

    getBalance: (instance, address) => {
        return instance.balanceOf(address);
    }
}

module.exports = contractHelper;