const express = require('express');
const router = express.Router();
const {handleCreateUrl, handleFetchUrl, handleEditUrl, handleDeleteUrl, handleAnalytics, handleClickData, handleDeviceInfo} = require('../controllers/url');
const isLoggedIn = require("../middlewares/auth");

router.post("/", isLoggedIn, handleCreateUrl);
router.get("/", isLoggedIn, handleFetchUrl);
router.put("/:id", isLoggedIn, handleEditUrl);
router.delete("/:id", isLoggedIn, handleDeleteUrl);
router.get("/analytics",isLoggedIn, handleAnalytics);
router.get("/clicks",isLoggedIn, handleClickData);
router.get("/devices",isLoggedIn, handleDeviceInfo);


module.exports = router; 