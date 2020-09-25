const api = require("./userController");
const express = require("express");
const router = express.Router();

router.get("/test", api.getApi);

module.exports = router;
