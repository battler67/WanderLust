const express = require("express");
const router = express.Router({ mergeParams: true });
const { isLoggedIn } = require("../middleware");
const bookmarkController = require("../controllers/bookmark");

router.post("/", isLoggedIn, bookmarkController.toggleBookmark);

module.exports = router;
