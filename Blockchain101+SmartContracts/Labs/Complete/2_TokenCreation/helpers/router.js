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
        label: "Send any amount of tokens from the owner account to the next one",
        file: "send-tokens-from-owner.js",
		prerequisites: ["askForAmmount"] 
    }, 
    {
        label: "Send any amount of tokens from an account to another",
        file: "send-tokens-custom.js", 
		prerequisites: ["askForSender", "askForReceiver", "askForAmmount"] 
    },
];

getParamsFromPrerequisites = async (prerequisites) => { 
	if(prerequisites == null){
		return "";
	}
	
	prerequisites.forEach((prerequisite) => {
		if( prerequisite == "askForAmmount" ){
			
		} else if( prerequisite == "askForSender" ){
			
		} else if( prerequisite == "askForReceiver" ){
			
		} else{
			throw "Prerequisite '" + prerequisite + "' is not implemented.";
		}
		
		return "ok";
	});
};

ask = async () => { 
	var childProcessParameters = "";
	console.log("Techlab Helpers\n==============");
	scripts.map((o, i) => console.log(i + " -> " + o.label));

    rl.question("\nChoice ? (q to quit)> ", async (answer) => {
        if (answer !== "q") {
            if (parseInt(answer) === NaN || scripts[answer] == null) {
                console.log("Please enter a valid number");
            } else {
				console.log("Running truffle exec on ./helper/" + scripts[answer].file)
				
				if(scripts[answer].prerequisites != null){
					// Since readline is ineffective when run from a sub process, 
					// let's get the infos here.
					childProcessParameters = await getParamsFromPrerequisites(scripts[answer].prerequisites);
					console.log(" -> with the following params : " + childProcessParameters);
				}
				
                const {
                    stdout,
                    stderr
                } = await exec('truffle exec ./helpers/' + scripts[answer].file + childProcessParameters);
				
                console.log('stdout:', stdout);
                
                if(stderr.length !== 0){
                    console.log(stderr);
                }
            }
            ask();
        }
    });
};

console.log('\x1Bc'); // console clear
ask();