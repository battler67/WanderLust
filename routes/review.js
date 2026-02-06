const express =  require("express");
const router = express.Router({ mergeParams: true });
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema,reviewSchema} = require("../schema.js");
const Listing = require("../models/listing");
const {validateReview} = require("../middleware.js");
const {validateListing,isLoggedIn,isOwner,isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/review.js");

router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destroyReview));

router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));

module.exports = router;