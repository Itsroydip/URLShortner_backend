const express = require('express');
const app = express();
const env = require('dotenv');
env.config();
const {connectToMongoDB} = require('./connect')
const MONGO_URI = process.env.MONGO_URI;
const userRoutes = require('./routes/user')
const cors = require('cors');
const PORT = process.env.PORT || 3000;

//Connection to database
connectToMongoDB(MONGO_URI);

app.use(cors(
    {
        origin: '*'
    }
));

//Middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//define api routes
app.use("/api/user", userRoutes);

// default route
app.get("/",(req,res)=>{
    res.send("URL Shortner!!!")
})


app.listen(PORT,()=>{
    console.log("Listening at port 5000....");
})