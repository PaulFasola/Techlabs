pragma solidity ^0.4.2;


contract Roulette {
    uint public nextRoundTimestamp;
    uint private _interval;
    address private _owner;
    uint private _bet_identifier;

    enum BetType { Single, Odd, Even }

    struct Bet {
        uint id;
        BetType betType;
        address player;
        uint number;
        uint value;
    }

    Bet[] public bets;

    event Resulted(uint number, uint nextRoundTimestamp, uint wonAmount);
    event NewSingleBet(uint betId, address player, uint number, uint value);
    event NewEvenBet(uint betId, address player, uint value);
    event NewOddBet(uint betId, address player, uint value);

    constructor(uint interval) public payable {
        _interval = interval;
        _owner = msg.sender;
        nextRoundTimestamp = now + _interval;
    }

    function getNextRoundTimestamp() public constant returns(uint) {
        return nextRoundTimestamp;
    }

    function getBetsLength() public constant returns(uint) {
         return bets.length;
    }

    function getBetAt(uint index) public constant returns(uint betId, address player, uint number, uint value, uint betType) {
        if(bets.length <= index) revert();
        if(bets[index].betType == BetType.Even){
            betType = 38;
        } else if(bets[index].betType == BetType.Odd){
            betType = 39;
        } else{
            betType = 0;
        }
        return (bets[index].id, bets[index].player, bets[index].number, bets[index].value, betType);
    }

    function betSingle(uint number) payable public transactionMustContainEther() bankMustBeAbleToPayForBetType(BetType.Single) {
        if (number <0 || number > 36) revert();
        uint BetId = _bet_identifier++;
        bets.push(Bet({
            id: _bet_identifier++,
            betType: BetType.Single,
            player: msg.sender,
            number: number,
            value: msg.value
        }));
        emit NewSingleBet(BetId, msg.sender, number, msg.value);
    }

    function betEven() payable public transactionMustContainEther() bankMustBeAbleToPayForBetType(BetType.Even) {
        uint BetId = _bet_identifier++;
        bets.push(Bet({
            id:BetId,
            betType: BetType.Even,
            player: msg.sender,
            number: 0,
            value: msg.value
        }));
        emit NewEvenBet(BetId, msg.sender, msg.value);
    }

    function betOdd() payable public transactionMustContainEther() bankMustBeAbleToPayForBetType(BetType.Even) {
        uint BetId = _bet_identifier++;
        bets.push(Bet({
            id: BetId,
            betType: BetType.Odd,
            player: msg.sender,
            number: 0,
            value: msg.value
        }));
        emit NewOddBet(BetId, msg.sender, msg.value);
    }

    function launch() public payable {
        if (now < nextRoundTimestamp) revert();
        uint number = uint(blockhash(block.number - 1)) % 37;
        uint won_amount = 0;

        for (uint i = 0; i < bets.length; i++) {
            bool won = false;

            if (bets[i].betType == BetType.Single) {
                if (bets[i].number == number) {
                    won = true;
                }
            } else if (bets[i].betType == BetType.Even) {
                if (number > 0 && number % 2 == 0) {
                    won = true;
                }
            } else if (bets[i].betType == BetType.Odd) {
                if (number > 0 && number % 2 == 1) {
                    won = true;
                }
            }
            if (won) {
                won_amount = won_amount * getPayoutForType(bets[i].betType);
                if (!bets[i].player.send(won_amount)) {
                    revert();
                }
            }
        }

        uint thisRoundTimestamp = nextRoundTimestamp;
        nextRoundTimestamp = thisRoundTimestamp + _interval;

        bets.length = 0;

        emit Resulted(number, nextRoundTimestamp, won_amount);
    }

    function getPayoutForType(BetType betType) public pure returns(uint) {
        if (betType == BetType.Single) return 35;
        else return 2;
    }

    modifier transactionMustContainEther() {
        if (msg.value == 0) revert();
        _;
    }

    modifier bankMustBeAbleToPayForBetType(BetType betType) {
        uint necessaryBalance = 0;
        for (uint i = 0; i < bets.length; i++) {
            necessaryBalance += getPayoutForType(bets[i].betType) * bets[i].value;
        }
        necessaryBalance += getPayoutForType(betType) * msg.value;
        uint currentBalance = address(this).balance;
        if (necessaryBalance > currentBalance) revert();
        _;
    }
}