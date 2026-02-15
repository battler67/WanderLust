if(process.env.NODE_ENV != "production"){
    require("dotenv").config({ path: "../.env" });
}
const initData = require("./data.js");
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const db_url = process.env.DB_URL;
main()
    .then((res) => { console.log("Connected to DB") })
    .catch((err) => console.log(err));

async function main() {
    await mongoose.connect(db_url);
}

const initDB = async() => {
    await Listing.deleteMany({});
    // initData.data = initData.data.map((obj)=>({...obj,owner:"6981f7e151aeb7900eb54af2"}));
    // await Listing.insertMany(initData.data);
    // console.log("data was initialised");
}
initDB();