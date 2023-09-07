
const express = require ("express");
const route=require ("./router/userroutes");
const route1=require ("./router/eventroutes");
const route2=require("./router/joinrouter")



const app = express();
app.use(express.urlencoded({extended:true}))
app.use(express.json());
app.use('/api', route);
app.use('/api', route1);
app.use('/api',route2)


app.listen(3000, (err) => {
  if (err) console.log(err);
  else console.log("Server listening on port 3000");
});
