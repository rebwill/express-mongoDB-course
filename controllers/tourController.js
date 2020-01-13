// IMPORTS

const fs = require('fs');

// FILE READING

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
  //               ^current dir ^go up one lvl
);
// ^^ before we can send the data, we need to read it.
// dirname is the folder where the current script is located
// JSON.parse converts to a javascript object

// PARAM MIDDLEWARE

exports.checkID = (req, res, next, val) => {
  //                                ^value of param (the id in the URL)
  // ^ this is a param middleware that does the validation of the ID, instead of repeating the same function in every Controller.
  console.log(`Tour id is: ${val}`);
  // if the tour variable does not find any matching items with tours.find (comes back undefined), return invalid ID
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }
  next();
};
// it needs a return statement because if the id IS invalid, we don't want it to continue on to the next() function!
// if it didn't have the return, it would keep going and end up sending an incorrect/error response.
// if the URL does not have an id, this middleware will be ignored.

// ROUTE HANDLERS

exports.getAllTours = (req, res) => {
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

exports.getTour = (req, res) => {
  console.log(req.params); // params is where the variables (like :id) are stored
  const id = req.params.id * 1; // Need to convert req.params.id from string to number. Javascript trick: when multiplying a string that looks like a number, by a number, it will convert the string automatically to a number.

  const tour = tours.find(el => el.id === id);
  // ^ find loops through tours array and returns T/F for the statement on each element. It returns the 1st array item that returns true.

  res.status(200).json({
    status: 'success',
    data: tour // tour comes from the tour variable above
  });
};

exports.createTour = (req, res) => {
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

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>'
    }
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    // 204 usually means "no content". Since we're deleting, we won't send any content back.
    status: 'success',
    data: null // this is to show that the resource we deleted no longer exists
  });
};
