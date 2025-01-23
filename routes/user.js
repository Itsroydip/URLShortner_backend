const express = require('express');
const router = express.Router();
const {handleSignUp, handleSignIn, handleEditUser, handleDeleteUser} = require('../controllers/user');
const isLoggedIn = require("../middlewares/auth");


router.post("/signup", handleSignUp);
router.post("/signin", handleSignIn);
router.put("/:id", isLoggedIn, handleEditUser);
router.delete("/:id", isLoggedIn, handleDeleteUser);



module.exports = router; 