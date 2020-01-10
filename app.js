const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express(); // express is actually a function that will add a bunch of methods to our 'app' variable

// 1) MIDDLEWARES

app.use(morgan('dev')); // into this function we can pass an argument that will specify how we want the logging to look like. We can use predefined strings for this.

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

app.use((req, res, next) => {
  console.log('hello from the middleware!');
  next();
  // ^ extremely important to include next function in all of your middleware. If we didn't call it, the req/res cycle would be stuck at this point and would not move on.
  // called "next" by convention but is actually just the 3rd param in the app.use method
  // middleware is called in the order it appears in the code. If you had this after the route handlers, it wouldn't be implemented because any res.___.json ends the req/res cycle.
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);
// ^^ before we can send the data, we need to read it.
// dirname is the folder where the current script is located
// JSON.parse converts to a javascript object

// 2. ROUTE HANDLERS

const getAllTours = (req, res) => {
  console.log(req.requestTime);
  // now, we send res back to the client
  res.status(200).json({
    status: 'success', // "success" = any 200 code; "fail" = error at the client; "error" = error at the server
    requestedAt: req.requestTime,
    results: tours.length, // only for convenience, to know how many results to expect
    data: {
      // data is an "envelope" for our data -- returns an object containing the data
      tours: tours // the latter "tours" corresponds to the "tours" in the GET url. AKA, the data that comes from that.
      // in reality, ES6 says if key and value have same name, you can just write it once, e.g. data { tours }. I'm leaving it as data { tours: tours } to be clear what it is
    }
  });
};

const getTour = (req, res) => {
  console.log(req.params); // params is where the variables (like :id) are stored
  const id = req.params.id * 1; // Need to convert req.params.id from string to number. Javascript trick: when multiplying a string that looks like a number, by a number, it will convert the string automatically to a number.

  if (id > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }
  // ^ This is to handle the case that an ID is requested that doesn't exist.

  const tour = tours.find(el => el.id === id);
  // ^ find loops through tours array and returns T/F for the statement on each element. It returns the 1st array item that returns true.

  res.status(200).json({
    status: 'success',
    data: tour // tour comes from the tour variable above
  });
};

const createTour = (req, res) => {
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
};

const updateTour = (req, res) => {
  // if (!tour) {
  // if the tour variable does not find any matching items with tours.find (comes back undefined), return invalid ID
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>'
    }
  });
};

const deleteTour = (req, res) => {
  // if (!tour) {
  // if the tour variable does not find any matching items with tours.find (comes back undefined), return invalid ID
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }
  res.status(204).json({
    // 204 usually means "no content". Since we're deleting, we won't send any content back.
    status: 'success',
    data: null // this is to show that the resource we deleted no longer exists
  });
};

// app.get('/api/v1/tours', getAllTours);
// // ^ if this endpoint is hit, do this ^ (getAllTours)
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// 3. ROUTES -- middleware functions that only apply to a certain route

app
  .route('/api/v1/tours/') // for this route, for the following HTTP methods, do these functions:
  .get(getAllTours)
  .post(createTour);
app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

// 4. START THE SERVER

const port = 3000; // define the port
app.listen(port, () => {
  // listen to the port
  console.log(`App running on port ${port}`);
});
