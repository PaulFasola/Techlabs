var bootstrap = function () {

    var Web3 = require('web3');
    var BigNumber = require('bignumber.js');
    
    if (typeof window.web3 !== 'undefined') {
          var web3 = new Web3(window.web3.currentProvider);
    } else {
        // set the provider you want from Web3.providers, for local dev
          var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    var manager_address = '0xbf6608b9a5eb9095e5e4ff453e01e736448ca0b6';
    var manager_abi = "";
    var lottery_abi = "";

    var manager_contract = web3.eth.contract(manager_abi);
    var lottery_contract = web3.eth.contract(lottery_abi);

    var ETHLotteryManager = manager_contract.at(manager_address);

    var lottery_map = {};

    var timeout = 0;
    ETHLotteryManager.lotteries(function (e, r) {
        r.forEach(function (address) {
            setTimeout(function () {
                add(address);
            }, timeout);
            timeout += 3000;
        });
    });

    ETHLotteryManager.Register(function (e, r) {
        add(r.address);
    });

    if (!web3.eth.accounts[0]) {
        var interval = setInterval(function () {
            if (web3.eth.accounts[0]) {
                clearInterval(interval);
                document.getElementById('error').innerText = '';
            }
            else {
                document.getElementById('error').innerText = 'Unlock MMS account';
            }
        }, 5000);
    }

    var lottery_data = function  (address, contract) {
        return {
            contract: contract,
            address: address,
            name: null,
            manager_address: null,
            owner: null,
            balance: 0,
            open: false,
            jackpot: 0,
            fee: 0,
            owner_fee: 0,
            create_block: 0,
            result_block: 0,
            winners_count: 0,
            result_hash: null,
            result: null,
            accumulated_from: null,
            accumulate_to: null
        };
    };

    var add = function (address) {
        if (lottery_map[address]) {
            return;
        }
        var ETHLottery = lottery_contract.at(address);
        var proxy = new Proxy(lottery_data(address, ETHLottery), {
            set: function (obj, prop, value) {
                obj[prop] = value;
                document.getElementById(address + '-' + prop).innerText = value;
                return true;
            }
        });
        var all_events = ETHLottery.allEvents({_sender: [web3.eth.accounts[0]] }, function (e, r) {
            switch (r.event) {
                case 'Open': 
                    lottery_map[r.address].open = r.args._open;
                break;

                case 'Play':
                    var article = document.getElementById(r.address);
                    var div = document.createElement('div');
                    div.id = address + '-bet-' + r.args._byte;
                    var text = document.createTextNode(r.args._time + ': ' + r.args._byte);
                    div.appendChild(text);
                    article.appendChild(div);
                break;

                case 'Balance':
                    lottery_map[r.address].balance = r.args._balance;
                break;

                case 'Result':
                    lottery_map[r.address].result = r.args._result;
                    var bet = document.getElementById(r.address + '-bet-' + r.args._result);
                    if (bet) {
                        var input = document.createElement('input');
                        input.id = r.address + '-' + 'withdraw';
                        input.type = 'button';
                        input.value = 'go get my ETHs.'
                        input.addEventListener('click', function () {
                            withdraw(r.address);
                        });
                        bet.appendChild(input);
                    }
                break;

                case 'Withdraw':
                    var input = document.getElementById(r.address + 'withdraw');
                    var text = document.createTextNode('withdraw ' + r.args._time  + ': ' + r.args._amount);
                    input.parentNode.appendChild(text);
                break;

                case 'Accumulate':
                    all_events.stopWatching();
                break;

                case 'Destroy':
                    all_events.stopWatching();
                break;
            }
        });
        lottery_map[address] = proxy;
        render(address);
        collect_data(address);
    };

    var collect_old_events = function (address) {
        var lottery = lottery_map[address];
        web3.eth.getBlockNumber(function (e, r) {
            block_number = r;
            var to_block = lottery.result_block > 0 ? lottery.result_block : block_number;
            lottery.contract.Play({_sender: [web3.eth.accounts[0]]}, { fromBlock: lottery.create_block, toBlock: to_block }, function (e, r) {
                if (e) { console.log(e); return; }
                var article = document.getElementById(r.address);
                var div = document.createElement('div');
                div.id = address + '-bet-' + r.args._byte;
                var text = document.createTextNode(r.args._time + ': ' + r.args._byte);
                div.appendChild(text);
                article.appendChild(div);
            });
            if (lottery.result_hash) {
                var bet = document.getElementById(address + '-bet-' + lottery.result);
                if (bet) {
                    var input = document.createElement('input');
                    input.id = address + '-' + 'withdraw';
                    input.type = 'button';
                    input.value = 'go get my ETHs.'
                    input.addEventListener('click', function () {
                        withdraw(address);
                    });
                    bet.appendChild(input);

                    lottery.contract.Withdraw({_sender: [web3.eth.accounts[0]]}, { fromBlock: lottery.create_block, toBlock: to_block }, function (e, r) {
                        var text = document.createTextNode('withdraw ' + r.args._time  + ': ' + r.args._amount);
                        bet.appendChild(text);
                    });
                }
            }
        });
    };

    var collect_data = function (address) {
        var lottery = lottery_map[address];
        var contract = lottery.contract;
        web3.eth.getBalance(address, function (e, r) { lottery.balance = r; });
        contract.name(function (e, r) { lottery.name = r; });
        contract.owner(function (e, r) { lottery.owner = r; });
        contract.open(function (e, r) { lottery.open = r; });
        contract.jackpot(function (e, r) { lottery.jackpot = r; });
        contract.fee(function (e, r) { lottery.fee = r; });
        contract.owner_fee(function (e, r) { lottery.owner_fee = r; });
        contract.create_block(function (e, r) {
            lottery.create_block = r;
            setTimeout(function () {
                collect_old_events(address);
            }, 2000);
        });
        contract.result_block(function (e, r) { lottery.result_block = r; });
        contract.winners_count(function (e, r) { lottery.winners_count = r; });
        contract.result_hash(function (e, r) { lottery.result_hash = r; });
        contract.result(function (e, r) { lottery.result = r; });
        contract.manager_address(function (e, r) { lottery.manager_address = r; });
        contract.accumulated_from(function (e, r) { lottery.accumulated_from = r; });
        contract.accumulate_to(function (e, r) { lottery.accumulate_to = r; });
    };

    var render = function (address) {
        var lottery = lottery_map[address];
        var section = document.getElementById('section');
        var article = document.createElement('article');
        article.id = address;
        for (var key in lottery) {
            if (key == 'contract') {
                continue;
            }
            var span = document.createElement('span');
            span.id = address + '-' + key;
            var text = document.createTextNode(lottery[key]);
            span.appendChild(text);
            var div = document.createElement('div');
            var text = document.createTextNode(key + ': ');
            div.appendChild(text);
            div.appendChild(span);
            article.appendChild(div);
        }
        var div = document.createElement('div');
        div.id = address + '-error';
        div.style = 'color: #f00;';
        var text = document.createTextNode('');
        div.appendChild(text);
        article.appendChild(div);

        var div = document.createElement('div');
        var text = document.createTextNode('BYTE: 0x');
        div.appendChild(text);

        var input = document.createElement('input');
        input.id = address + '-play';
        input.size = 2;
        input.maxlength = 2;
        div.appendChild(input);
        article.appendChild(div);

        var input = document.createElement('input');
        input.id = address + '-' + 'submit';
        input.type = 'button';
        input.value = 'go lucky byte, do you shit.'
        input.addEventListener('click', function () {
            play(address);
        });
        div.appendChild(input);
        article.appendChild(div);

        section.appendChild(article);
    };

    var play = function (address) {
        var lottery = lottery_map[address];
        document.getElementById(address + '-error').innerText = '';
        var guess = document.getElementById(address + '-play').value;
        if (guess.length == 2 && guess.match(/[0-9a-f]{2}/)) {
            guess = "0x" + guess;
            var fee = new BigNumber(document.getElementById(address + '-fee').innerText);
            lottery.contract.play(guess, { from : web3.eth.accounts[0], value: fee }, function (e, r) {
                if (e) {
                    document.getElementById(address + '-error').innerText = e.message;
                    console.log(e.message);
                }
                if (r) {
                    console.log('play tx ' + r);
                }
            });
        }
        else {
            document.getElementById(address + '-error').innerText = 'enter lucky byte';
        }
    };

    var withdraw = function (address) {
        var lottery = lottery_map[address];
        document.getElementById(address + '-error').innerText = "";
        lottery.contract.withdraw({ from : web3.eth.accounts[0] }, function (e, r) {
            if (e) {
                document.getElementById(address + '-error').innerText = e.message;
                console.log(e.message);
            }
            if (r) {
                console.log('withdraw tx ' + r);
            }
        });
    };

    return { play: play, withdraw: withdraw };
};

var app = null;
window.addEventListener('load', function() {
    app = bootstrap();
}, false );