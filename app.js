const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express(); // express is actually a function that will add a bunch of methods to our 'app' variable

// 1) MIDDLEWARES
// (the ones that we want to apply to ALL routes)

app.use(morgan('dev')); // into this function we can pass an argument that will specify how we want the logging of the request to look like. We can use predefined strings for this ('dev' is one of these predefined strings).

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

// 2. ROUTE HANDLERS
// (moved to their own separate files: tourRoutes.js and userRoutes.js for routes and HTTP request types, and tourController.js & userController.js to define handler functions for each)

// app.get('/api/v1/tours', getAllTours);
// // ^ if this endpoint is hit, do this ^ (getAllTours)
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// 3. ROUTES
// (middleware functions that only apply to a certain route)

// "Mounting the router"
app.use('/api/v1/tours/', tourRouter);
app.use('/api/v1/users/', userRouter);
// "For this route, we want to apply the tourRouter middleware"
// Because they are middleware, we can use app.use to mount them.
// each function is defined in its own file, and imported at beginning of this file

module.exports = app;
