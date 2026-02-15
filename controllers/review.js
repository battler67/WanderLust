const Review  = require("../models/review");
const Listing = require("../models/listing");
module.exports.destroyReview = async (req,res) =>{
        let {id,reviewId} = req.params;
        await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
        await Review.findByIdAndDelete(reviewId);
        req.flash("success","review deleted");
        res.redirect(`/listings/${id}`);
};

module.exports.createReview = async (req,res)=>{
    let listing = await Listing.findById(req.params.id).populate("reviews");
    let newReview = await Review(req.body.review);

    const alreadyReviewed = listing.reviews.some(review => review.author.equals(req.user._id));

    if (alreadyReviewed) {
        req.flash("error", "You have already reviewed this listing.");
        return res.redirect(`/listings/${listing._id}`);
    }
    listing.reviews.push(newReview);
    newReview.author  = req.user._id;
    // console.log(newReview);
    let savedReview = await newReview.save();
    await listing.save();
    // console.log("new review saved");
    // res.send("newReview is saved");
    req.flash("success","New Review Created!");
    res.redirect(`/listings/${req.params.id}`)
};

module.exports.renderEditForm = async (req, res) => {
    const { id, reviewId } = req.params;

    const listing = await Listing.findById(id);
    const review = await Review.findById(reviewId);

    res.render("reviews/edit", { listing, review });
};
module.exports.updateReview = async (req, res) => {
    const { reviewId } = req.params;
    await Review.findByIdAndUpdate(reviewId, req.body.review);
    req.flash("success", "Review updated!");
    res.redirect(`/listings/${req.params.id}`);
};