if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}
console.log(process.env.SECRET);
const express = require("express");
const app = express();
const mongoose = require('mongoose');
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
// const ExpressError = require("./ExpressError.js");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema,reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");
const { wrap } = require("module");
// const Error = require("./views/Error.ejs");

const multer  = require('multer')
const {storage} = require("./cloudinaryConfig.js");
const upload = multer({ storage:storage })

const flash = require("connect-flash");
const User = require("./models/user.js");
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;

const cookieParser  = require("cookie-parser");
app.use(cookieParser());
const session =  require("express-session");
const MongoStore = require("connect-mongo").default;

const store =  MongoStore.create({
    mongoUrl: process.env.DB_URL,
    crypto : {
        secret: process.env.SESSION_SECRET,
    },
    touchAfter:24*3600,
});
store.on("error",(err)=>{
    console.log('error occured in connect-mongo store sessions',err);
});
const sessionOptions = {
    store,
    secret:"mysuperSecretKey",
    resave:false,
    saveUninitialized:true,//false can also be used
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true, // to prevent from cross scripting attacks
    }
};
app.use(session(sessionOptions)); // for every routeing request , it is saved with session id as cokiee in client browser
app.use(flash()); // write this after app.use(sessions) and before any routes


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// app.get("/demouser",async (req,res)=>{
//     let fakeUser = new User({
//         email:"murali@gmail.com",
//         username:"murali",
//     });
//     let RegisteredUser = await User.register(fakeUser,"helloworld");
//     res.send(RegisteredUser);   
// });

const DB_URL  = process.env.DB_URL;
main()
    .then((res) => { console.log("Connected to DB") })
    .catch((err) => console.log(err));

async function main() {
    await mongoose.connect(DB_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.use(express.urlencoded({
    extended: true
}));
app.use(methodOverride("_method"));

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});// ensure to save locals just before the routes so evrything is defined properly

const listingsRouter = require("./routes/listing.js");
app.use("/listings",listingsRouter);

const reviewsRouter = require("./routes/review.js");
app.use("/listings/:id/reviews",reviewsRouter);

const userRouter = require("./routes/user.js");
app.use("/",userRouter);

// const bookmarkRoutes = require("./routes/bookmark");

// app.use("/listings/:id/bookmark", bookmarkRoutes);

app.use("/random", (req, res, next) => {
    // console.log("hi i am a middleqare");
    // //res.send("middleware finished");
    // return next();
    req.time = new Date(Date.now()).toString();
    console.log(req.method, req.hostname, req.path, req.time);
    next();
});

function asynWrap(fn) {
    return function(req, res, next) {
        fn(req, res, next).catch((err) => next(err));
    };
};


const checkToken = (req, res, next) => {
    let { token } = req.query;
    if (token === "giveaccess") {
        return next();
    }
    res.send("ACCESS DENIED");
};

app.use("/api", checkToken, (req, res) => {
    res.send("data");
});

// app.get("/", (req, res) => {
//     console.log(req.cookies);
//     res.send("app working");
// });


// app.get("/testListings", async(req, res) => {
// let list = new Listing({
//     title: "my new villa",
//     description: "by beach",
//     price: 1200,
//     location: "visakhapatnam",
//     country: "India",
// });
// await list.save();
//     res.send("success");
//     console.log("res sent successfully");
// });

app.get("/err", (req, res) => {
    // abcd = abcd;
    throw new ExpressError(401, "error occured baby");
});
// const handleValidationError = (err) => {
//     console.log(err.status);
//     console.dir(err.message);
//     return err;
// };
// app.use(asynWrap((err, req, res, next) => {
//     let { status = 500, message = "some error has been occured" } = err;
//     console.log("--==ERROR-----");
//     console.log(err.name, err.message);
//     if (err.name === "ValidationError") {
//         err = handleValidationError(err);
//     }
//     // next(err);
//     res.status(status).send(message);
// }));
// app.use((err, req, res, next) => {
//     console.log("------ERROR2-----");
//     next(err);
// });


app.get("/admin", (req, res) => {
    throw new ExpressError(403, "you are not allowed to access this");
});
app.get("/test-session", (req, res) => {
    if (!req.session.count) {
        req.session.count = 1;
    } else {
        req.session.count++;
    }
    res.send(`Session count: ${req.session.count}`);
});
app.all("/{*splat}",(req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
});
app.use((err,req,res,next)=>{
    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong";
    res.status(statusCode).render("Error.ejs",{message});
    // res.status(statusCode).send(message);
});
app.listen(5500, (req, res) => {
    console.log("app is listening");
});