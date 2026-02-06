const express = require("express");
const app = express();
const router = express.Router();


const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");


const usersController = require("../controllers/users");
function wrapAsync(fn) {
    return function(req, res, next) {
        fn(req, res, next).catch((err) => next(err));
    };
};
router.route("/signup")
    .get((req,res)=>{
        res.render("users/signup.ejs")
    })
    .post(wrapAsync(usersController.signup));

router.route("/login") // create login form + logging in user
    .get(usersController.renderLoginForm)
    .post(
    saveRedirectUrl,
    passport.authenticate('local',
    {failureRedirect:"/login",failureFlash:true})
    ,usersController.login);

router.get("/logout",usersController.signOut);


module.exports = router;