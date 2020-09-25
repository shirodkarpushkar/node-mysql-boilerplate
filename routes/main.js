var express= require('express')
var users = require('../modules/users/userRoutes')

var app = express()
app.use("/users", users);

module.exports = app
