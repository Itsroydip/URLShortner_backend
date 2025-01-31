const express = require('express');
const router = express.Router();
const {handleCreateUrl, handleFetchUrl, handleEditUrl, handleDeleteUrl, handleAnalytics} = require('../controllers/url');
const isLoggedIn = require("../middlewares/auth");

router.post("/", isLoggedIn, handleCreateUrl);
router.get("/", isLoggedIn, handleFetchUrl);
router.put("/:id", isLoggedIn, handleEditUrl);
router.delete("/:id", isLoggedIn, handleDeleteUrl);
router.get("/analytics",isLoggedIn, handleAnalytics);


module.exports = router; 