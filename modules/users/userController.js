var db = require("../../database/dbConnect");
let getApi = function (req, res) {
  res.send("hello world!");
};


module.exports = {
  getApi,
};