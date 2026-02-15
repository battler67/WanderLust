const { number } = require("joi");
const mongoose = require("mongoose");

const passportLocalMongoose = require("passport-local-mongoose");
// console.log(typeof passportLocalMongoose);

const userSchema = new mongoose.Schema({    
    email:{
        type:String,
        required:true,
    },
    bookmarks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Listing"
        }
    ]
});
userSchema.plugin(passportLocalMongoose.default);
module.exports  =  mongoose.model("User",userSchema);