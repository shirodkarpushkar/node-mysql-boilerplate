const api = require("../Controller/user");
const express = require("express");
const router = express.Router();

router.get("/promiseApi", api.getApi);

module.exports = router;
