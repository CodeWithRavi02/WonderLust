const express = require("express");
const app = express();
const path = require("path");
const Listing = require("./models/listing.js");
const initDB= require("./init/data.js");
const mongoose = require("mongoose");
const MONGO_URL="mongodb://localhost:27017/wonderLust";
main()
.then(()=>{
    console.log("mongoose is connect");
})
.catch((err)=>{
console.log(err);
})
 async function main(){
    await mongoose.connect(MONGO_URL);
 }
 app.set("view engine","ejs");
 app.set("views",path.join(__dirname,"views"));
 app.use(express.urlencoded({extended: true}));
   //new route
     app.get("/listings/new",async(req, res)=>{
      const newListings=await Listing.find({});
      res.render("./listings/new.ejs",{newListings});
     })
//index rought
  app.get("/listings",async (req,res)=>{
    const allListings =await Listing.find({});
     res.render("./listings/index.ejs",{allListings});
     })
   
     //show route
  app.get("/listings/:id", async(req, res)=>{
      let {id}= req.params;
      const listing = await Listing.findById(id);
      res.render("./listings/show.ejs",{listing});
  })
  //edit route
  app.get("/listing/:id",async (req, res)=>{
    let {id}= req.params;
    const listing= await Listing.findById(id);
    res.render("./listing/:id/edit.ejs",{});
  })
app.get("/",(req, res)=>{
  res.send("server is working");
})
app.listen(4000,()=>{
    console.log("app is listning");
})