const { number } = require("joi");
const mongoose = require("mongoose");

const passportLocalMongoose = require("passport-local-mongoose");
// console.log(typeof passportLocalMongoose);

const userSchema = new mongoose.Schema({    
    email:{
        type:String,
        required:true,
    },
});
userSchema.plugin(passportLocalMongoose.default);
module.exports  =  mongoose.model("User",userSchema);