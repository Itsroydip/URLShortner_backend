const express = require('express');
const router = express.Router();
const {handleSignUp, handleSignIn, handleEditUser, handleDeleteUser, handleGetUser} = require('../controllers/user');
const isLoggedIn = require("../middlewares/auth");


router.post("/signup", handleSignUp);
router.post("/signin", handleSignIn);
router.get("/",isLoggedIn, handleGetUser);
router.put("/", isLoggedIn, handleEditUser);
router.delete("/", isLoggedIn, handleDeleteUser);



module.exports = router; 