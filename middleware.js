const Listing = require("./models/listing");
const ExpressError = require("./ExpressError.js");
const {listingSchema,reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");

module.exports.isLoggedIn = (req,res,next) => {
    console.log(req.user);
    if(!req.isAuthenticated()){
        req.session.requestUrl = req.originalUrl;
        req.flash("error","You must be Logged in to create Listing!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req,res,next)=>{
    if( req.session.requestUrl ){
        res.locals.redirectUrl = req.session.requestUrl;
        delete req.session.redirectUrl;
    }
    next();
};
module.exports.isOwner = async (req,res,next) =>{
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currentUser._id)){
        req.flash("error","You have to be Owner to update");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing = (req, res, next) => {
    if (!req.body || !req.body.listing) {
        throw new ExpressError(400, "Send valid data for listing");
    }
    console.log("BODY:", req.body);
    const { error } = listingSchema.validate(req.body.listing);
    if (error) {
        throw new ExpressError(400, error.details[0].message);
    }
    next();
};

module.exports.validateReview = (req,res,next) =>{
    if (!req.body || !req.body.review) {
        throw new ExpressError(400, "Review data is required");
    }
    const {error} = reviewSchema.validate(req.body);
    console.log(error);
    if(error){
        console.log(`this is the eror ${error}`);
        throw new ExpressError(400,error.details[0].message);
    }
    next();
}

module.exports.isReviewAuthor = async (req,res,next) => {
    let { id,reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currentUser._id)){
        req.flash("error","You have to be Author to change");
        return res.redirect(`/listings/${id}`); 
    }
    next();
};