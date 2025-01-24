const Url = require("../schemas/url.schema");
const User = require("../schemas/user.schema");
const shortid = require('shortid');

const handleCreateUrl = async (req, res) => {
    try {
        const { redirectUrl, remarks, expiration } = req.body;
        const isUrlExist = await Url.findOne({redirectUrl});
        if(isUrlExist){
            return res.status(400).json({message: "Url already exists"});
        }        

        const user = await User.findOne({email: req.user.email});
        const userId = user._id;
        const shortId = shortid();
        const expirationDate = new Date(expiration);
        const url = new Url({
            shortId,
            redirectUrl,
            remarks,
            expiration: expirationDate,
            userId
        });
        console.log(url)
        await url.save();
        res.status(200).json({
            message: "Url created successfully",
            shortId
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    handleCreateUrl
}