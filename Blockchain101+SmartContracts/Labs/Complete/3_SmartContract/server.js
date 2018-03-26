const express = require('express');
const path = require('path');
const app = express();
const port = 8080;

// this is bad and you don't want to see this line on prod...
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.static('public'));

app.get('/', (request, response) => {
   
})

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})