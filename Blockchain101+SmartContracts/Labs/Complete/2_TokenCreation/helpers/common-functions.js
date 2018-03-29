 exports.getBalances = async (instance, web3) => {
     var balances = [];
     web3.eth.accounts.forEach(async (account) => {
         var balance = await instance.balanceOf(account);
         balances.push({
             account: account,
             balance: balance
         });
     });
     
     console.log(balances);
     return balances;
 }

 exports.getBalance = async (instance, address) => {
     return await instance.balanceOf(address);
 }