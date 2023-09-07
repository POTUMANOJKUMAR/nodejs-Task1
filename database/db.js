const Mysql=require("mysql2");
const conection = Mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "eventapp",
  });
  conection.connect((err) => {
    if (err) console.log(err);
    else console.log("connected!");
  });
  module.exports=conection