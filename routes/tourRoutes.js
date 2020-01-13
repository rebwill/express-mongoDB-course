const express = require('express');
const tourController = require('./../controllers/tourController');
//                            ^current folder / go up one folder / down into Controllers
// this imports an object that includes all of the EXPORTS from the tourController.js file. We can then target each one (e.g. tourController.getTour)
// You could also do this like this:
// const { getAllTours, createTour, etc} = require('./../controllers/tourController');

const router = express.Router();

router.param('id', tourController.checkID);
// if the URL does not have an id, this middleware will be ignored.

router
  .route('/') // for this route, for the following HTTP methods, do these functions:
  .get(tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
