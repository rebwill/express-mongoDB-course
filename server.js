// good practice to have everything related to express in one file (app.js) and everything related to the server in another file (server.js).

// IMPORT APP

const app = require('./app');

// START THE SERVER

const port = 3000; // define the port
app.listen(port, () => {
  // listen to the port
  console.log(`App running on port ${port}`);
});
