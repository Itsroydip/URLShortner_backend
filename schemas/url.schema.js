 const mongoose = require('mongoose');

 const schema = new mongoose.Schema({
     shortId: {
         type: String,
         required: true
     },
     redirectUrl: {
         type: String,
         required: true,
         unique: true
     },
     remarks: {
         type: String,
     },
     expiration: {
         type: Date,
         required: true
     },
     visitHistory: [{
        timestamp:{type:Number},
        ip:{type:String},
        device:{type:String},
     }],
     userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
 },
    {
        timestamps: true
    }
);
 
 module.exports = mongoose.model("Url", schema);
 
 