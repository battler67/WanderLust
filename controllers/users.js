const User = require("../models/user");
module.exports.signup = async (req,res)=>{
    try{
        let {username,email,password} = req.body;
        const newUser  = new User({
            email,username
        });
        const RegisteredUser = await User.register(newUser,password);
        console.log(RegisteredUser);
        req.login(RegisteredUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success","Welcome to WanderLust");
            res.redirect("/listings");
        });
    }catch(e){
        req.flash("error","User With given Credentials Already exists");
        res.redirect("/signup");
    }
};

module.exports.signOut = (req,res,next)=>{
    req.logout(function (err) {
    if (err) {
        return next(err);
    }
    req.flash("success", "Logged out successfully!");
    res.redirect("/listings");
    });
};

module.exports.renderLoginForm = (req,res)=>{
    // console.log(passport._strategies);
    res.render("users/login.ejs");
};

module.exports.login = async(req,res)=>{
    req.flash("success","You are successfully logged in !");
    res.locals.redirectUrl = res.locals.redirectUrl || "listings";
    res.redirect(res.locals.redirectUrl);
};