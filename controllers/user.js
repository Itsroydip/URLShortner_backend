const User = require("../schemas/user.schema");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('dotenv');
env.config();


const handleSignUp = async(req,res)=>{
    try{
        const {email,password,name,phone} = req.body;
        const isUserExist = await User.findOne({email});

        if(isUserExist){
            return res.status(400).json({message: "Email already exists"});          
        }

        const hashedPassword = bcrypt.hashSync(password,10);
        const newUser = await new User({email, password: hashedPassword, name, phone}).save();
        const token = jwt.sign({email},process.env.JWT_SECRET);

        return res.status(200).json({message: "User created successfully", token, id:newUser._id})
        
    }
    catch(err){
        console.log(err);
        res.status(500).json({message: "Server error"})
    }
}


const handleSignIn = async(req,res)=>{
    try {
        const {email, password} = req.body;
        const isUserExist = await User.findOne({email});
        console.log(isUserExist)

        if(!isUserExist){
            res.status(400).json({message: "Invalid email or password!"})
            return;
        }
        else{
            const isPasswordCorrect = await bcrypt.compare(password, isUserExist.password);
            console.log(isPasswordCorrect)

            if(!isPasswordCorrect){
                res.status(400).json({message:"Invalid email or password"})
                return;
            }
            const token = jwt.sign({email},process.env.JWT_SECRET);
            res.status(200).json({message:"Login successfull", token, id:isUserExist._id, name:isUserExist.name});

        }
    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Server error"});
    }
}


const handleGetUser = async (req,res) => {
    try {
        const user = await User.findOne({email: req.user.email});

        if(!user)
            return res.status(400).json({message: "User don't exist"});
        
        return res.status(200).json(user);
        
    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Server error"});
    }

}

const handleEditUser = async (req, res)=>{
    try {
        const {name, email, phone} = req.body;
        const user = await User.findOne({email: req.user.email});

        user.name = name;
        user.email = email;
        user.phone = phone;

        await user.save();
        return res.status(200).json({message: "User details updated successfully"});
        
    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Server error"});
    }
}

const handleDeleteUser = async (req, res)=>{
    try {
        const user = await User.findOne({email: req.user.email});

        await user.deleteOne({_id: req.params.id});      
        return res.status(200).json({message: "User deleted successfully"});
        
    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Server error"});
    }
}

module.exports = {
    handleSignUp,
    handleSignIn,
    handleEditUser,
    handleDeleteUser,
    handleGetUser
}