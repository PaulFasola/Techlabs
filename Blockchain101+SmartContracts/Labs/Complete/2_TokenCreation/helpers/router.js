const util = require('util');
const exec = util.promisify(require('child_process').exec);

var readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const scripts = [{
        label: "Read account balances",
        file: "read-balances.js"
    },
    {
        label: "Send some tokens",
        file: "send-token.js"
    },
];

ask = async () => {
    rl.question("Choice ? (q to quit)> ", async (answer) => {
        if (answer !== "q") {
            if (parseInt(answer) === NaN || scripts[answer] == null) {
                console.log("Please enter a valid number");
            } else {
                const {
                    stdout,
                    stderr
                } = await exec('truffle exec ');
                console.log('stdout:', stdout);
                
                if(stderr.length !== 0){
                    console.log(stderr);
                }
            }
            ask();
        }
    });
}

console.log("Techlab Helpers\n==============");
scripts.map((o, i) => console.log(i + " -> " + o.label));
ask();