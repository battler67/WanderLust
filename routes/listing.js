const express =  require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema,reviewSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing");
const Review = require("../models/review.js");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("../models/user");
const {validateListing,isLoggedIn,isOwner} = require("../middleware.js");
const listingController = require("../controllers/listing.js");

const multer  = require('multer')
const {storage} = require("../cloudinaryConfig.js");
const upload = multer({ storage:storage })

router.use(session({
    secret: "wanderlust",
    resave: false,
    saveUninitialized: false
}));

router.use(passport.initialize());
router.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// const isLoggedIn = (req, res, next) => {
    
// };

router.get("/new",isLoggedIn,listingController.renderNewForm);

router.route("/:id")//read -->show route + update listing

    .get( wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner,upload.single('listing[image]'),validateListing,wrapAsync(listingController.updateListing))
    .delete(isLoggedIn,isOwner,
    wrapAsync(listingController.destroyListing));

router.route("/")//new route creation + create route  + delete listing
    .get( wrapAsync(listingController.index)) 
    .post(upload.single('listing[image]'),validateListing,wrapAsync(listingController.createListing))

//edit 
router.get("/:id/edit",isLoggedIn, wrapAsync(listingController.editListing));

// app.use((req, res) => {
//     res.status(404).send("Page not found");
// });

module.exports = router;