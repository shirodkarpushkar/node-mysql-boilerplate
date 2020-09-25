var express= require('express')
var users = require('../modules/users/Routes/user')

var app = express()
app.use("/users", users);

module.exports = app
