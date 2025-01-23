const mongoose = require('mongoose');

function connectToMongoDB(MONGO_URI){
    mongoose.connect(MONGO_URI)
    .then(()=>{
        console.log("Connected to MongoDB.......")
    })
    .catch((err)=>{
        console.log(err)
    })

}

module.exports = {
    connectToMongoDB
}