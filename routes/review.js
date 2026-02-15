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

router.post("/",isLoggedIn,wrapAsync(
    reviewController.createReview
))
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destroyReview));
router.get("/:reviewId/edit",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.renderEditForm));

router.patch(
    "/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewController.updateReview)
);
module.exports = router;