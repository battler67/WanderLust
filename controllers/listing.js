const Listing = require("../models/listing");
const { listingSchema,reviewSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");

const mbxGeoCoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeoCoding({ accessToken: mapToken });


module.exports.index = async(req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index", { allListings });
}
module.exports.renderNewForm  = (req,res)=>{  
    res.render("listings/new.ejs");
};

module.exports.showListing = async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews",populate:{path:"author", }}).populate("owner");
    // let result = listingSchema.validate(req.body);
    // console.log(result);
    console.log(listing);
    if(!listing){
        req.flash("error","Listing you requested for is not present!");
        res.redirect("/listings");
    }else res.render("listings/show", { listing });
};
module.exports.createListing = async(req, res,next) => {
        let cordinate = await geocodingClient.forwardGeocode({
                        query: req.body.listing.location,
                        limit: 1
                        })
                        .send()

        let url = req.file.path;
        let filename = req.file.filename;
        // console.log(req.body);
        
        console.log("cordinate: ",cordinate.body.features[0].geometry);
        let newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = {url,filename};
        newListing.geometry = cordinate.body.features[0].geometry;
        // console.log(newListing);
        //we need high level object here
        let savedListing = await newListing.save();
        console.log("saved listing ",savedListing);
        req.flash("success","new Listing created");
        res.redirect("/listings");
};

module.exports.editListing  = async(req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    // console.log(listing); 

    let OriginalImageUrl = listing.image.url;
    OriginalImageUrl = OriginalImageUrl.replace("/upload","/upload/h_300/w_250")
    if(!listing){
        req.flash("error","Listing you requested for is not present!");
        res.redirect("/listings");
    }else res.render("listings/edit.ejs", { listing ,OriginalImageUrl});
};

module.exports.updateListing = async(req, res) => {
    let { id } = req.params;
    let newListing = {...req.body.listing };
    let result = listingSchema.validate(req.body);

    // console.log(result);
    // if(!newListing.title){
    //     throw new ExpressError(400,"Title is missing");
    // }
    // Above is one way of adding validation 
    // console.log(newListing);
    // newListing.image = "https://images.pexels.com/photos/240526/pexels-photo-240526.jpeg"
    // console.log("current User",currentUser);
    // console.log("listing ",listing );
    let listing = await Listing.findByIdAndUpdate(id, newListing);
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url,filename};
        // await lisitng.findByIdAndUpdate(id,listing);
        await listing.save()
    }
    // res.render("listings/show.ejs", { listing: req.body.listing });
    req.flash("success","Listing Updated");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req, res) => {
    let { id } = req.params;
    console.log("DELETE HIT");
    let deltedListing = await Listing.findByIdAndDelete(id);
    console.log(deltedListing);
    req.flash("success","Listing Deleted");
    res.redirect("/listings");
};