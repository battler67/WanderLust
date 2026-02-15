const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review  = require("./review");
const { required } = require("joi");

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
});
const listingSchema = new Schema({
  title: {
    type: String
  },
  description: String,
  image: {
    filename: {
      type: String,
      default: "listingimage"
    },
    url: {
      type: String,
      default: "https://images.unsplash.com/photo-1566073771259-6a8506099945"
    }
  },
  price: Number,
  location: String,
  country: String,
  reviews:[
    {
      type:Schema.Types.ObjectId,
      ref:"Review"
    },
  ],
  owner:{
    type:Schema.Types.ObjectId,
    ref:"User"
  },
  geometry:{
    type:pointSchema,
  },
  category: {
        type: String,
        enum: [
            "Rooms",
            "Iconic Cities",
            "Mountains",
            "Castles",
            "Pools",
            "Camps",
            "Farms",
            "Arctic",
            "Domes",
            "Boats"
        ],
        default:"Rooms"
    }
}, { timestamps: true });

listingSchema.post("findOneAndDelete",async (listing)=>{
    if(listing){
      await Review.deleteMany({_id:{$in:listing.reviews}});
    }
});
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;