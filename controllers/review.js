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
    let listing = await Listing.findById(req.params.id);
    let newReview = await Review(req.body.review);
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
