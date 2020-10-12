import mysql from 'mysql'
import config from '@config'

var con = mysql.createConnection({
  port: config.DBPORT,
  host: config.DBHost,
  user: config.DBUser,
  password: config.DBPassword,
  database: config.DBName,
  multipleStatements: true,
});

dbConnect();

function dbConnect() {
  con.connect(function (err) {
    if (err) {
      console.log("Error connecting to Database", err);
      return;
    }

    console.log("Started iteration on - " + new Date());
    console.log("Connection established");
  });
}

module.exports = con;
