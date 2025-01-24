const express = require('express');
const router = express.Router();
const {handleCreateUrl} = require('../controllers/url');
const isLoggedIn = require("../middlewares/auth");

router.post("/create", isLoggedIn, handleCreateUrl);
// router.post("/signin", handleSignIn);
// router.put("/:id", isLoggedIn, handleEditUser);
// router.delete("/:id", isLoggedIn, handleDeleteUser);


module.exports = router; 