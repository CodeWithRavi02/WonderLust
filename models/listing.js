const mongoose= require("mongoose");
const Schema = mongoose.Schema;
const listingSchema = new Schema({
    title:{
    type:String,
    required:true,
},
description:{
    type:String,
    required:true
},
image:{
        filename: {
            type: String,
        },
        url: {
            type: String,
            default: "https://cdn.pixabay.com/photo/2018/08/04/11/30/draw-3583548_1280.png",
            set: (v) => (v === "" ? "https://cdn.pixabay.com/photo/2018/08/04/11/30/draw-3583548_1280.png" : v),
        },
},
price:Number,
location:String,
country:String,})


const Listing= mongoose.model("Listing", listingSchema);
module.exports= Listing;