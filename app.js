const fs = require('fs');
const express = require('express');

const app = express(); // express is actually a function that will add a bunch of methods to our 'app' variable

app.use(express.json()); // express.json is middleware: a function that can modify the incoming request data.
// A step the request goes through while being processed.
// It adds data from the body into the request object for POST requests.

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

// GET REQUESTS

app.get('/api/v1/tours', (req, res) => {
  // now, we send res back to the client
  res.status(200).json({
    status: 'success', // "success" = any 200 code; "fail" = error at the client; "error" = error at the server
    results: tours.length, // only for convenience, to know how many results to expect
    data: {
      // data is an "envelope" for our data -- returns an object containing the data
      tours: tours // the latter "tours" corresponds to the "tours" in the GET url. AKA, the data that comes from that.
      // in reality, ES6 says if key and value have same name, you can just write it once, e.g. data { tours }. I'm leaving it as data { tours: tours } to be clear what it is
    }
  });
});

// POST REQUESTS

app.post('/api/v1/tours', (req, res) => {
  // out of the box, Express does not include the data to be sent (POSTed) in the request. So we need to use middleware.
  //   console.log(req.body); // body becomes available on the request due to using the middleware earlier in the code.

  const newID = tours[tours.length - 1].id + 1; // this sets the ID of the new item as the ID of the last item in the existing array, plus one
  const newTour = Object.assign({ id: newID }, req.body);
  // ^ Object.assign allows us to create a new object by merging two existing objects
  // ^ We already have tours available from reading the tours file earlier
  // So we are merging the newID for the new tour with the body of the request

  tours.push(newTour);
  // ^ So now we have the new array, but we need to push that into the JSON file.
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      // ^ 1st param: the file we want to write to; 2nd: what to write (JSON version of the tours object); 3rd: function for what we want it to do when it's done writing the file)
      res.status(201).json({
        // 200 = okay; 201 = created (AKA we created a new resource on the server)
        status: 'success',
        data: newTour
      });
    }
  );
  // ^ Not using writeFileSync because this is running in the event loop and we cannot block the event loop with a synchronous function.
});

const port = 3000; // define the port
app.listen(port, () => {
  // listen to the port
  console.log(`App running on port ${port}`);
});
