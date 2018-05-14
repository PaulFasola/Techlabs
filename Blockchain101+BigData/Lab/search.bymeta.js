const driver = require('bigchaindb-driver');
const sleep = require('sleep');
const config = require('./config');

const conn = new driver.Connection(config.API_PATH, {
    app_id: config.APP_ID,
    app_key: config.APP_KEY
});

conn.searchMetadata('Clients and orders')
    .then(metas => metas.forEach(meta => {
         conn.searchAssets(meta.id)
            .then(results => {
                console.log(results);
            });
    }));