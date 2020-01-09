const fs = require('fs');
const express = require('express');

const app = express(); // express is actually a function that will add a bunch of methods to our 'app' variable

// app.get('/', (req, res) => {
//   // for all get requests: 1st param is root URL, 2nd param is a callback function taking req/res as params
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side!', app: 'Natours' }); // no need to set content type to "application/json", Express does it automatically with the .json method
// });

// app.post('/', (req, res) => {
//   // you can send different responses for different URLs and HTTP methods.
//   res.send('You can post to this endpoint');
// });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);
// ^^ before we can send the data, we need to read it.
// dirname is the folder where the current script is located
// JSON.parse converts to a javascript object

app.get('/api/v1/tours', (req, res) => {
  // now, we send res back to the client
  res.status(200).json({
    status: 'success', // "success" = any 200 code; "fail" = error at the client; "error" = error at the server
    results: tours.length,
    data: {
      // data is an "envelope" for our data -- returns an object containing the data
      tours: tours // the latter "tours" corresponds to the "tours" in the GET url. AKA, the data that comes from that.
      // in reality, ES6 says if key and value have same name, you can just write it once, e.g. data { tours }. I'm leaving it as data { tours: tours } to be clear what it is
    }
  });
});

const port = 3000; // define the port
app.listen(port, () => {
  // listen to the port
  console.log(`App running on port ${port}`);
});
