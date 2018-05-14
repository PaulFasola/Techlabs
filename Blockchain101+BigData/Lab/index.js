const uuid = require('uuid');
const faker = require('faker');
const sleep = require('sleep');
const driver = require('bigchaindb-driver')
const config = require('./config')

// Create a new keypair.
const keypair = new driver.Ed25519Keypair()

function inject() {

    let _key = uuid();

    // Construct a transaction payload
    const tx = driver.Transaction.makeCreateTransaction(
        // Define the asset to store, in this example it is the current temperature
        // (in Celsius) for the city of Berlin.
        {
            key: _key,
            FirstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            email: faker.internet.email(),
            orders: [{
                name: faker.commerce.productName(),
                color: faker.commerce.product.color,
                company: faker.company.companyName(),
                price: faker.commerce.product.price
            }]
        },

        // Metadata contains information about the transaction itself
        // (can be `null` if not needed)
        {
            what: 'Clients and orders'
        },

        // A transaction needs an output
        [driver.Transaction.makeOutput(
            driver.Transaction.makeEd25519Condition(keypair.publicKey))],
        keypair.publicKey
    )

    console.log(config.consoleColors.lightcyan, JSON.stringify(tx));

    // Sign the transaction with private keys
    const txSigned = driver.Transaction.signTransaction(tx, keypair.privateKey)

    // Send the transaction off to BigchainDB
    const conn = new driver.Connection(config.API_PATH, {
        app_id: config.APP_ID,
        app_key: config.APP_KEY
    })

    sleep.sleep(2)

    conn.postTransactionCommit(txSigned)
        .then(retrievedTx => console.log(config.consoleColors.green, 'Transaction', retrievedTx.id, 'successfully posted.'))
        .then(() => inject())
}

inject();